package com.recruitment.app.modules.identity.application;

import com.recruitment.app.modules.identity.application.exception.OAuthIdentityException;
import com.recruitment.app.modules.identity.application.port.out.OAuthAuthorizationCodeStore;
import com.recruitment.app.modules.identity.domain.model.OAuthCodeSnapshot;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
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

/**
 * Creates the short-lived, single-use code used to hand a browser OAuth login
 * back to a separate frontend without placing JWTs in the redirect URL.
 */
@Service
@ConditionalOnProperty(prefix = "app.security.oauth2.google", name = "enabled", havingValue = "true")
public class OAuthAuthorizationCodeService {

    private static final int RANDOM_BYTES = 32;

    private final OAuthAuthorizationCodeStore authorizationCodes;
    private final Duration authorizationCodeTtl;
    private final Clock clock;
    private final SecureRandom secureRandom = new SecureRandom();

    @org.springframework.beans.factory.annotation.Autowired
    public OAuthAuthorizationCodeService(
            OAuthAuthorizationCodeStore authorizationCodes,
            @Value("${app.security.oauth2.google.authorization-code-ttl:PT1M}") Duration authorizationCodeTtl,
            Clock clock
    ) {
        this.authorizationCodes = authorizationCodes;
        this.authorizationCodeTtl = authorizationCodeTtl == null ? Duration.ofMinutes(1) : authorizationCodeTtl;
        this.clock = clock;
    }

    public OAuthAuthorizationCodeService(
            OAuthAuthorizationCodeStore authorizationCodes,
            Clock clock,
            Duration authorizationCodeTtl
    ) {
        this(authorizationCodes, authorizationCodeTtl, clock);
    }

    @Transactional
    public IssuedAuthorizationCode issueFor(Long userId, String codeChallenge, String transactionId) {
        String validatedChallenge = validateCodeChallenge(codeChallenge);
        String validatedTransactionId = validateTransactionId(transactionId);
        byte[] bytes = new byte[RANDOM_BYTES];
        secureRandom.nextBytes(bytes);
        String rawCode = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        Instant expiresAt = clock.instant().plus(authorizationCodeTtl);

        authorizationCodes.save(
                userId,
                sha256(rawCode),
                validatedChallenge,
                validatedTransactionId,
                expiresAt
        );
        return new IssuedAuthorizationCode(rawCode, validatedTransactionId, expiresAt);
    }

    @Transactional(noRollbackFor = OAuthIdentityException.class)
    public Long consume(String rawCode, String codeVerifier, String transactionId) {
        String validatedTransactionId = validateTransactionIdForConsumption(transactionId);
        Instant now = clock.instant();
        OAuthCodeSnapshot code = authorizationCodes.lockByCodeHash(sha256(rawCode))
                .orElseThrow(OAuthAuthorizationCodeService::invalidCode);

        if (!code.isUsable(now)) {
            throw invalidCode();
        }

        if (!matches(code.transactionId(), validatedTransactionId)
                || !matches(code.codeChallenge(), deriveCodeChallenge(codeVerifier))) {
            // A handoff code is single-use even when an attacker presents a
            // wrong verifier, preventing online verifier guessing.
            authorizationCodes.markConsumed(code.id(), now);
            throw invalidCode();
        }

        authorizationCodes.markConsumed(code.id(), now);
        return code.userId();
    }

    private static OAuthIdentityException invalidCode() {
        return new OAuthIdentityException("OAuth authorization code is invalid or expired");
    }

    private static String sha256(String value) {
        if (value == null || !value.matches("[A-Za-z0-9_-]{43}")) {
            throw invalidCode();
        }
        try {
            return HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.US_ASCII))
            );
        }
        catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private static String validateCodeChallenge(String codeChallenge) {
        if (codeChallenge == null || !codeChallenge.matches("[A-Za-z0-9_-]{43}")) {
            throw new OAuthIdentityException("PKCE code challenge is invalid");
        }
        return codeChallenge;
    }

    private static String validateTransactionId(String transactionId) {
        if (transactionId == null || !transactionId.matches("[A-Za-z0-9_-]{43}")) {
            throw new OAuthIdentityException("OAuth transaction id is invalid");
        }
        return transactionId;
    }

    private static String validateTransactionIdForConsumption(String transactionId) {
        if (transactionId == null || !transactionId.matches("[A-Za-z0-9_-]{43}")) {
            throw invalidCode();
        }
        return transactionId;
    }

    private static boolean matches(String expected, String actual) {
        return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.US_ASCII),
                actual.getBytes(StandardCharsets.US_ASCII)
        );
    }

    private static String deriveCodeChallenge(String codeVerifier) {
        if (codeVerifier == null || !codeVerifier.matches("[A-Za-z0-9\\-._~]{43,128}")) {
            throw invalidCode();
        }
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(codeVerifier.getBytes(StandardCharsets.US_ASCII));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        }
        catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    public record IssuedAuthorizationCode(String rawCode, String transactionId, Instant expiresAt) {
    }
}
