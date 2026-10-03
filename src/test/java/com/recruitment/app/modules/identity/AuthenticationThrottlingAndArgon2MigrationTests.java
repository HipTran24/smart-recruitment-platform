package com.recruitment.app.modules.identity;

import com.recruitment.app.ApplicationTests;
import com.recruitment.app.modules.identity.application.AuthenticationThrottlingService;
import com.recruitment.app.modules.identity.infrastructure.persistence.entity.Role;
import com.recruitment.app.modules.identity.infrastructure.persistence.entity.User;
import com.recruitment.app.modules.identity.infrastructure.persistence.repository.RoleRepository;
import com.recruitment.app.modules.identity.infrastructure.persistence.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class AuthenticationThrottlingAndArgon2MigrationTests {

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

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private AuthenticationThrottlingService throttlingService;

    @Test
    void transparentlyMigratesLegacyBcryptPasswordToArgon2idOnSuccessfulLogin() throws Exception {
        String email = "bcrypt-legacy@example.test";
        String rawPassword = "Legacy-Password-123";

        // Seed user with legacy BCrypt hash
        BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder(10);
        String legacyHash = bcrypt.encode(rawPassword);
        assertTrue(legacyHash.startsWith("$2a$") || legacyHash.startsWith("$2b$"));

        User user = new User(email, legacyHash, "Legacy BCrypt User");
        Role candidateRole = roleRepository.findByCode("ROLE_CANDIDATE").orElseThrow();
        user.addRole(candidateRole);
        userRepository.saveAndFlush(user);

        // Login with password
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"%s"}
                                """.formatted(email, rawPassword)))
                .andExpect(status().isOk());

        // Verify that database passwordHash was upgraded to Argon2id
        User upgradedUser = userRepository.findByEmail(email).orElseThrow();
        String upgradedHash = upgradedUser.getPasswordHash();
        assertTrue(upgradedHash.startsWith("$argon2id$"),
                "Password hash must be transparently upgraded to Argon2id on successful login");

        // Subsequent login verifies directly with Argon2id
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"%s"}
                                """.formatted(email, rawPassword)))
                .andExpect(status().isOk());
    }

    @Test
    void throttlingLocksOutAccountAfterRepeatedFailedAttempts() throws Exception {
        String email = "brute-force@example.test";
        String password = "Correct-Password-123";

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"Throttling Tester","email":"%s","password":"%s"}
                                """.formatted(email, password)))
                .andExpect(status().isCreated());

        throttlingService.recordSuccess(email);

        // Fail 5 consecutive times
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"email":"%s","password":"WrongPassword-999"}
                                    """.formatted(email)))
                    .andExpect(status().isUnauthorized());
        }

        // 6th attempt is throttled with HTTP 429
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"%s"}
                                """.formatted(email, password)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("TOO_MANY_REQUESTS"));

        // Reset throttling releases lockout
        throttlingService.recordSuccess(email);
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"%s"}
                                """.formatted(email, password)))
                .andExpect(status().isOk());
    }
}
