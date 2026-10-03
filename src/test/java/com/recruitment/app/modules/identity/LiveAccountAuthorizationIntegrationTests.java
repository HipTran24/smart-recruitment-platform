package com.recruitment.app.modules.identity;

import com.recruitment.app.ApplicationTests;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class LiveAccountAuthorizationIntegrationTests {

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
    private UserRepository userRepository;

    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    @Test
    void disabledAccountTokensAreRejectedImmediatelyByLiveAuthorization() throws Exception {
        String email = "disabled-user@example.test";
        String registerBody = """
                {"fullName":"Disabled Candidate","email":"%s","password":"Password-123456"}
                """.formatted(email);

        var regResponse = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse();

        var tree = jsonMapper.readTree(regResponse.getContentAsString());
        String accessToken = tree.path("accessToken").asText();
        String refreshToken = tree.path("refreshToken").asText();

        // Active account can access /me
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk());

        // Deactivate user in database
        User user = userRepository.findByEmail(email).orElseThrow();
        user.deactivate();
        userRepository.saveAndFlush(user);

        // Access token must now be rejected immediately by live authorization check
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isUnauthorized());

        // Refresh token must also fail
        String refreshBody = """
                {"refreshToken":"%s"}
                """.formatted(refreshToken);
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(refreshBody))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void changingPasswordIncrementsCredentialVersionAndInvalidatesExistingTokens() throws Exception {
        String email = "pw-change-user@example.test";
        String initialPassword = "Old-Password-123456";
        String newPassword = "New-Password-123456";

        String registerBody = """
                {"fullName":"Password Change Tester","email":"%s","password":"%s"}
                """.formatted(email, initialPassword);

        var regResponse = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse();

        var tree = jsonMapper.readTree(regResponse.getContentAsString());
        String oldAccessToken = tree.path("accessToken").asText();
        String oldRefreshToken = tree.path("refreshToken").asText();

        // Change password
        String changeBody = """
                {"currentPassword":"%s","newPassword":"%s"}
                """.formatted(initialPassword, newPassword);

        mockMvc.perform(post("/api/v1/auth/password/change")
                        .header("Authorization", "Bearer " + oldAccessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(changeBody))
                .andExpect(status().isNoContent());

        // Old access token must now be rejected because credential version was incremented
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + oldAccessToken))
                .andExpect(status().isUnauthorized());

        // Old refresh token must be revoked
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"refreshToken":"%s"}
                                """.formatted(oldRefreshToken)))
                .andExpect(status().isUnauthorized());

        // Login with new password succeeds and issues fresh tokens
        var loginResponse = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"%s"}
                                """.formatted(email, newPassword)))
                .andExpect(status().isOk())
                .andReturn().getResponse();

        String newAccessToken = jsonMapper.readTree(loginResponse.getContentAsString()).path("accessToken").asText();
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + newAccessToken))
                .andExpect(status().isOk());
    }
}
