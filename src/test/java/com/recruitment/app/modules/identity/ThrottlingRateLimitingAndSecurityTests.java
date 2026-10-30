package com.recruitment.app.modules.identity;

import com.recruitment.app.ApplicationTests;
import com.recruitment.app.modules.identity.application.AuthenticationThrottlingService;
import com.recruitment.app.modules.identity.infrastructure.integration.email.LoggingAccountNotificationGateway;
import com.recruitment.app.modules.identity.infrastructure.persistence.entity.OAuthAuthorizationCode;
import com.recruitment.app.modules.identity.infrastructure.persistence.entity.User;
import com.recruitment.app.modules.identity.infrastructure.persistence.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class ThrottlingRateLimitingAndSecurityTests {

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        if (!ApplicationTests.MYSQL.isRunning()) {
            ApplicationTests.MYSQL.start();
        }
        registry.add("spring.datasource.url", ApplicationTests.MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", ApplicationTests.MYSQL::getUsername);
        registry.add("spring.datasource.password", ApplicationTests.MYSQL::getPassword);
        registry.add("app.security.client-ip.trust-forwarded-header", () -> "false");
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationThrottlingService throttlingService;

    @Autowired
    private LoggingAccountNotificationGateway notificationGateway;

    @BeforeEach
    void setUp() {
        throttlingService.resetAll();
        notificationGateway.clear();
    }

    @Test
    void rotatingXForwardedForCannotBypassLoginLockoutWhenHeaderUntrusted() throws Exception {
        String email = "spoof-xff@example.test";
        String password = "Password-123456";

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"XFF Tester","email":"%s","password":"%s"}
                                """.formatted(email, password)))
                .andExpect(status().isCreated());

        // Attempt 5 failed logins with changing X-Forwarded-For headers
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/v1/auth/login")
                            .header("X-Forwarded-For", "203.0.113." + (i + 1))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"email":"%s","password":"WrongPassword-1"}
                                    """.formatted(email)))
                    .andExpect(status().isUnauthorized());
        }

        // 6th attempt with yet another spoofed IP must STILL be throttled because remoteAddr is used
        mockMvc.perform(post("/api/v1/auth/login")
                        .header("X-Forwarded-For", "203.0.113.99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"%s"}
                                """.formatted(email, password)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("TOO_MANY_REQUESTS"));
    }

    @Test
    void passwordResetRequestsDoNotPolluteOrLockoutLoginKeySpace() throws Exception {
        String email = "legit-user@example.test";
        String password = "ValidPassword-123";

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"Legit User","email":"%s","password":"%s"}
                                """.formatted(email, password)))
                .andExpect(status().isCreated());

        // Perform 50 reset requests with different emails from this IP
        for (int i = 0; i < 50; i++) {
            mockMvc.perform(post("/api/v1/auth/password/reset-request")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"email":"someone%d@example.test"}
                                    """.formatted(i)));
        }

        // Login for legit user from same IP must still succeed immediately!
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"%s"}
                                """.formatted(email, password)))
                .andExpect(status().isOk());
    }

    @Test
    void passwordResetIsRateLimitedPerEmailWithoutAffectingLogin() throws Exception {
        String email = "reset-target@example.test";
        String password = "TargetPassword-123";

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"Reset Target","email":"%s","password":"%s"}
                                """.formatted(email, password)))
                .andExpect(status().isCreated());

        // 3 reset requests succeed
        for (int i = 0; i < 3; i++) {
            mockMvc.perform(post("/api/v1/auth/password/reset-request")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"email":"%s"}
                                    """.formatted(email)))
                    .andExpect(status().isOk());
        }

        // 4th reset request is throttled
        mockMvc.perform(post("/api/v1/auth/password/reset-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s"}
                                """.formatted(email)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("TOO_MANY_REQUESTS"));

        // Login with valid credentials is NOT locked out
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"%s"}
                                """.formatted(email, password)))
                .andExpect(status().isOk());
    }

    @Test
    void endToEndEmailVerificationAndResetFlowViaNotificationGateway() throws Exception {
        String email = "e2e-user@example.test";
        String initialPassword = "InitialPassword-123";
        String newPassword = "UpdatedPassword-123";

        // 1. Register candidate
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"E2E User","email":"%s","password":"%s"}
                                """.formatted(email, initialPassword)))
                .andExpect(status().isCreated());

        // User email_verified should initially be false
        User user = userRepository.findByEmail(email).orElseThrow();
        assertEquals(false, user.isEmailVerified());

        // 2. Consume verification token from notification gateway and verify
        String verifyToken = notificationGateway.consumeLatestVerificationToken(email)
                .orElseThrow(() -> new AssertionError("Verification token should be recorded"));
        assertTrue(notificationGateway.getLatestVerificationToken(email).isEmpty(),
                "No plaintext verification token retained in gateway after consumption");

        mockMvc.perform(post("/api/v1/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"token":"%s"}
                                """.formatted(verifyToken)))
                .andExpect(status().isNoContent());

        // Verify in DB that email is verified
        User verifiedUser = userRepository.findByEmail(email).orElseThrow();
        assertEquals(true, verifiedUser.isEmailVerified());

        // Reusing the same verification token fails
        mockMvc.perform(post("/api/v1/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"token":"%s"}
                                """.formatted(verifyToken)))
                .andExpect(status().isBadRequest());

        // 3. Request password reset
        mockMvc.perform(post("/api/v1/auth/password/reset-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s"}
                                """.formatted(email)))
                .andExpect(status().isOk());

        String resetToken = notificationGateway.consumeLatestResetToken(email)
                .orElseThrow(() -> new AssertionError("Reset token should be recorded"));
        assertTrue(notificationGateway.getLatestResetToken(email).isEmpty(),
                "No plaintext reset token retained in gateway after consumption");

        // 4. Confirm password reset
        mockMvc.perform(post("/api/v1/auth/password/reset-confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"token":"%s","newPassword":"%s"}
                                """.formatted(resetToken, newPassword)))
                .andExpect(status().isNoContent());

        // 5. Old password no longer works
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"%s"}
                                """.formatted(email, initialPassword)))
                .andExpect(status().isUnauthorized());

        // 6. New password works
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"%s"}
                                """.formatted(email, newPassword)))
                .andExpect(status().isOk());
    }

    @Test
    void oauthAuthorizationCodeEntityAcceptsFlexibleTransactionIdLengths() {
        String codeHash = "a".repeat(64);
        String codeChallenge = "b".repeat(43);
        Instant expiresAt = Instant.now().plusSeconds(60);

        // 43 chars (32-byte base64url) - valid
        String tx43 = "c".repeat(43);
        assertDoesNotThrow(() -> new OAuthAuthorizationCode(1L, codeHash, codeChallenge, tx43, expiresAt));

        // 64 chars - valid
        String tx64 = "d".repeat(64);
        assertDoesNotThrow(() -> new OAuthAuthorizationCode(1L, codeHash, codeChallenge, tx64, expiresAt));

        // 128 chars - valid
        String tx128 = "e".repeat(128);
        assertDoesNotThrow(() -> new OAuthAuthorizationCode(1L, codeHash, codeChallenge, tx128, expiresAt));

        // 42 chars - invalid
        String tx42 = "f".repeat(42);
        assertThrows(IllegalArgumentException.class,
                () -> new OAuthAuthorizationCode(1L, codeHash, codeChallenge, tx42, expiresAt));

        // 129 chars - invalid
        String tx129 = "g".repeat(129);
        assertThrows(IllegalArgumentException.class,
                () -> new OAuthAuthorizationCode(1L, codeHash, codeChallenge, tx129, expiresAt));
    }

    @Test
    void refreshFailuresAreRateLimitedPerIp() throws Exception {
        String invalidRefreshToken = "a".repeat(43);

        for (int i = 0; i < 30; i++) {
            mockMvc.perform(post("/api/v1/auth/refresh")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"refreshToken":"%s"}
                                    """.formatted(invalidRefreshToken)))
                    .andExpect(status().isUnauthorized());
        }

        // 31st attempt must be 429 TOO_MANY_REQUESTS
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"refreshToken":"%s"}
                                """.formatted(invalidRefreshToken)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("TOO_MANY_REQUESTS"));
    }

    @Test
    void notificationGatewayMemoryIsBounded() {
        for (int i = 0; i < 250; i++) {
            notificationGateway.sendPasswordResetNotification("user" + i + "@example.test", "token-" + i);
        }
        // Early tokens must have been evicted, keeping total bounded at <= 200
        assertTrue(notificationGateway.getLatestResetToken("user0@example.test").isEmpty());
        assertTrue(notificationGateway.getLatestResetToken("user249@example.test").isPresent());
    }
}
