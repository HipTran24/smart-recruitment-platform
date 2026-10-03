package com.recruitment.app.modules.identity.application;

import com.recruitment.app.modules.identity.application.exception.IdentityAuthenticationException;
import com.recruitment.app.modules.identity.application.exception.InvalidCurrentPasswordException;
import com.recruitment.app.modules.identity.application.exception.InvalidResetTokenException;
import com.recruitment.app.modules.identity.application.port.out.IdentityAccountStore;
import com.recruitment.app.modules.identity.application.port.out.PasswordResetStore;
import com.recruitment.app.modules.identity.domain.model.AccountSnapshot;
import com.recruitment.app.modules.identity.domain.model.PasswordResetTokenSnapshot;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;

@Service
public class PasswordManagementService {

    private static final Duration DEFAULT_RESET_TTL = Duration.ofMinutes(15);
    private static final int TOKEN_BYTES = 32;

    private final IdentityAccountStore accounts;
    private final PasswordResetStore passwordResetStore;
    private final PasswordEncoder passwordEncoder;
    private final TokenSessionService tokenSessions;
    private final Clock clock;
    private final Duration resetTokenTtl;
    private final SecureRandom secureRandom = new SecureRandom();

    @org.springframework.beans.factory.annotation.Autowired
    public PasswordManagementService(
            IdentityAccountStore accounts,
            PasswordResetStore passwordResetStore,
            PasswordEncoder passwordEncoder,
            TokenSessionService tokenSessions,
            Clock clock
    ) {
        this(accounts, passwordResetStore, passwordEncoder, tokenSessions, clock, DEFAULT_RESET_TTL);
    }

    public PasswordManagementService(
            IdentityAccountStore accounts,
            PasswordResetStore passwordResetStore,
            PasswordEncoder passwordEncoder,
            TokenSessionService tokenSessions,
            Clock clock,
            Duration resetTokenTtl
    ) {
        this.accounts = Objects.requireNonNull(accounts, "accounts must not be null");
        this.passwordResetStore = Objects.requireNonNull(passwordResetStore, "password reset store must not be null");
        this.passwordEncoder = Objects.requireNonNull(passwordEncoder, "password encoder must not be null");
        this.tokenSessions = Objects.requireNonNull(tokenSessions, "token sessions must not be null");
        this.clock = Objects.requireNonNull(clock, "clock must not be null");
        this.resetTokenTtl = Objects.requireNonNull(resetTokenTtl, "reset token TTL must not be null");
    }

    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        validatePassword(newPassword);
        AccountSnapshot user = accounts.findForUpdate(userId)
                .filter(AccountSnapshot::active)
                .orElseThrow(IdentityAuthenticationException::new);

        if (!passwordEncoder.matches(currentPassword, user.passwordHash())) {
            throw new InvalidCurrentPasswordException();
        }

        accounts.updatePassword(userId, passwordEncoder.encode(newPassword));
        tokenSessions.revokeAllFor(userId);
    }

    @Transactional
    public Optional<String> requestPasswordReset(String rawEmail) {
        String email = normalizeEmail(rawEmail);
        Optional<AccountSnapshot> userOpt = accounts.findByEmail(email).filter(AccountSnapshot::active);
        if (userOpt.isEmpty()) {
            return Optional.empty();
        }

        AccountSnapshot user = userOpt.get();
        String rawToken = generateRawToken();
        String tokenHash = hashToken(rawToken);
        Instant expiresAt = clock.instant().plus(resetTokenTtl);
        passwordResetStore.saveToken(user.id(), tokenHash, expiresAt);
        return Optional.of(rawToken);
    }

    @Transactional
    public void confirmPasswordReset(String rawToken, String newPassword) {
        validatePassword(newPassword);
        Instant now = clock.instant();
        String tokenHash = hashToken(rawToken);

        PasswordResetTokenSnapshot token = passwordResetStore.lockToken(tokenHash)
                .orElseThrow(InvalidResetTokenException::new);

        if (token.consumed() || token.isExpired(now)) {
            throw new InvalidResetTokenException();
        }

        AccountSnapshot user = accounts.findForUpdate(token.userId())
                .filter(AccountSnapshot::active)
                .orElseThrow(InvalidResetTokenException::new);

        accounts.updatePassword(user.id(), passwordEncoder.encode(newPassword));
        passwordResetStore.consumeToken(token.id(), now);
        tokenSessions.revokeAllFor(user.id());
    }

    private String generateRawToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hashToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new InvalidResetTokenException();
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.strip().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    private static void validatePassword(String value) {
        if (value == null || value.length() < 12 || value.length() > 128) {
            throw new IllegalArgumentException("Password must be between 12 and 128 characters");
        }
    }

    private static String normalizeEmail(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Email must not be blank");
        }
        return value.strip().toLowerCase(Locale.ROOT);
    }
}
