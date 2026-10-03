package com.recruitment.app.modules.identity.application;

import com.recruitment.app.modules.identity.application.exception.InvalidVerificationTokenException;
import com.recruitment.app.modules.identity.application.port.out.EmailVerificationStore;
import com.recruitment.app.modules.identity.application.port.out.IdentityAccountStore;
import com.recruitment.app.modules.identity.domain.model.EmailVerificationTokenSnapshot;
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
import java.util.Objects;

@Service
public class EmailVerificationService {

    private static final Duration DEFAULT_VERIFICATION_TTL = Duration.ofHours(24);
    private static final int TOKEN_BYTES = 32;

    private final IdentityAccountStore accounts;
    private final EmailVerificationStore verificationStore;
    private final Clock clock;
    private final Duration verificationTokenTtl;
    private final SecureRandom secureRandom = new SecureRandom();

    @org.springframework.beans.factory.annotation.Autowired
    public EmailVerificationService(
            IdentityAccountStore accounts,
            EmailVerificationStore verificationStore,
            Clock clock
    ) {
        this(accounts, verificationStore, clock, DEFAULT_VERIFICATION_TTL);
    }

    public EmailVerificationService(
            IdentityAccountStore accounts,
            EmailVerificationStore verificationStore,
            Clock clock,
            Duration verificationTokenTtl
    ) {
        this.accounts = Objects.requireNonNull(accounts, "accounts must not be null");
        this.verificationStore = Objects.requireNonNull(verificationStore, "verification store must not be null");
        this.clock = Objects.requireNonNull(clock, "clock must not be null");
        this.verificationTokenTtl = Objects.requireNonNull(verificationTokenTtl, "verification token TTL must not be null");
    }

    @Transactional
    public String createVerificationToken(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("user id must be positive");
        }
        String rawToken = generateRawToken();
        String tokenHash = hashToken(rawToken);
        Instant expiresAt = clock.instant().plus(verificationTokenTtl);
        verificationStore.saveToken(userId, tokenHash, expiresAt);
        return rawToken;
    }

    @Transactional
    public void verifyEmail(String rawToken) {
        Instant now = clock.instant();
        String tokenHash = hashToken(rawToken);

        EmailVerificationTokenSnapshot token = verificationStore.lockToken(tokenHash)
                .orElseThrow(InvalidVerificationTokenException::new);

        if (token.consumed() || token.isExpired(now)) {
            throw new InvalidVerificationTokenException();
        }

        accounts.markEmailVerified(token.userId());
        verificationStore.consumeToken(token.id(), now);
    }

    private String generateRawToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hashToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new InvalidVerificationTokenException();
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.strip().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
