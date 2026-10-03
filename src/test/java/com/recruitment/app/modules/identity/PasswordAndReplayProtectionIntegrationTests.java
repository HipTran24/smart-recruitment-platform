package com.recruitment.app.modules.identity;

import com.recruitment.app.ApplicationTests;
import com.recruitment.app.modules.identity.application.EmailVerificationService;
import com.recruitment.app.modules.identity.application.PasswordManagementService;
import com.recruitment.app.modules.identity.infrastructure.persistence.entity.User;
import com.recruitment.app.modules.identity.infrastructure.persistence.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.json.JsonMapper;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class PasswordAndReplayProtectionIntegrationTests {

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        if (!ApplicationTests.MYSQL.isRunning()) {
            ApplicationTests.MYSQL.start();
        }
        registry.add("spring.datasource.url", ApplicationTests.MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", ApplicationTests.MYSQL::getUsername);
        registry.add("spring.datasource.password", ApplicationTests.MYSQL::getPassword);
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PasswordManagementService passwordManagementService;

    @Autowired
    private EmailVerificationService emailVerificationService;

    @Autowired
    private UserRepository userRepository;

    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    @Test
    void passwordResetTokenCannotBeReplayed() throws Exception {
        String email = "reset-replay@example.test";
        String initialPassword = "Initial-Password-123";
        String newPassword = "Reset-Password-456";

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"Reset Tester","email":"%s","password":"%s"}
                                """.formatted(email, initialPassword)))
                .andExpect(status().isCreated());

        String rawToken = passwordManagementService.requestPasswordReset(email).orElseThrow();

        // Confirm reset first time - succeeds
        mockMvc.perform(post("/api/v1/auth/password/reset-confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"token":"%s","newPassword":"%s"}
                                """.formatted(rawToken, newPassword)))
                .andExpect(status().isNoContent());

        // Replay reset second time with same token - rejected
        mockMvc.perform(post("/api/v1/auth/password/reset-confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"token":"%s","newPassword":"%s"}
                                """.formatted(rawToken, newPassword)))
                .andExpect(status().isBadRequest());

        // Can login with new password
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"%s"}
                                """.formatted(email, newPassword)))
                .andExpect(status().isOk());
    }

    @Test
    void refreshTokenReplayDetectsTheftAndRevokesAllSessions() throws Exception {
        String email = "refresh-theft@example.test";
        var reg = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"Theft Tester","email":"%s","password":"Password-123456"}
                                """.formatted(email)))
                .andExpect(status().isCreated())
                .andReturn().getResponse();

        String r1 = jsonMapper.readTree(reg.getContentAsString()).path("refreshToken").asText();

        // Rotate R1 to get R2
        var rotate = mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"refreshToken":"%s"}
                                """.formatted(r1)))
                .andExpect(status().isOk())
                .andReturn().getResponse();

        String r2 = jsonMapper.readTree(rotate.getContentAsString()).path("refreshToken").asText();

        // Replay R1 (theft simulation) - must fail with 401 and revoke all sessions for this account
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"refreshToken":"%s"}
                                """.formatted(r1)))
                .andExpect(status().isUnauthorized());

        // Subsequent use of R2 must now also fail because theft revoked all sessions
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"refreshToken":"%s"}
                                """.formatted(r2)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void emailVerificationTokenSucceedsAndCannotBeReplayed() throws Exception {
        String email = "verify-replay@example.test";
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"Verify Tester","email":"%s","password":"Password-123456"}
                                """.formatted(email)))
                .andExpect(status().isCreated());

        User user = userRepository.findByEmail(email).orElseThrow();
        String rawToken = emailVerificationService.createVerificationToken(user.getId());

        // Verify first time - succeeds
        mockMvc.perform(post("/api/v1/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"token":"%s"}
                                """.formatted(rawToken)))
                .andExpect(status().isNoContent());

        User verifiedUser = userRepository.findByEmail(email).orElseThrow();
        assertTrue(verifiedUser.isEmailVerified());

        // Replay verification token - rejected
        mockMvc.perform(post("/api/v1/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"token":"%s"}
                                """.formatted(rawToken)))
                .andExpect(status().isBadRequest());
    }
}
