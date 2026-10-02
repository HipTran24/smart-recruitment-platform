package com.recruitment.app.modules.identity.application;

import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Objects;

/**
 * Issues short-lived JWT access credentials and rotates database-backed,
 * opaque refresh credentials.
 *
 * <p>Refresh credential reuse revokes every active session for the account.
 * This intentionally favors account safety over a duplicate-refresh retry;
 * clients should serialize token refresh requests.</p>
 */
public class TokenSessionService {

    private static final int REFRESH_TOKEN_BYTES = 32;
    private static final String REFRESH_TOKEN_PATTERN = "[A-Za-z0-9_-]{43}";

    private final JwtSubjectResolver subjectResolver;
    private final AccessTokenIssuer accessTokenIssuer;
    private final RefreshTokenStore refreshTokenStore;
    private final Clock clock;
    private final Duration refreshTokenTtl;
    private final SecureRandom secureRandom;

    public TokenSessionService(
            JwtSubjectResolver subjectResolver,
            AccessTokenIssuer accessTokenIssuer,
            RefreshTokenStore refreshTokenStore,
            Clock clock,
            Duration refreshTokenTtl
    ) {
        this(subjectResolver, accessTokenIssuer, refreshTokenStore, clock, refreshTokenTtl, new SecureRandom());
    }

    TokenSessionService(
            JwtSubjectResolver subjectResolver,
            AccessTokenIssuer accessTokenIssuer,
            RefreshTokenStore refreshTokenStore,
            Clock clock,
            Duration refreshTokenTtl,
            SecureRandom secureRandom
    ) {
        this.subjectResolver = Objects.requireNonNull(subjectResolver, "subject resolver must not be null");
        this.accessTokenIssuer = Objects.requireNonNull(accessTokenIssuer, "access token issuer must not be null");
        this.refreshTokenStore = Objects.requireNonNull(refreshTokenStore, "refresh token store must not be null");
        this.clock = Objects.requireNonNull(clock, "clock must not be null");
        this.refreshTokenTtl = requirePositive(refreshTokenTtl, "refresh token TTL");
        this.secureRandom = Objects.requireNonNull(secureRandom, "secure random must not be null");
    }

    /**
     * Starts a new session for an active account. Login and OAuth success
     * handlers should call this after the account has been persisted.
     */
    @Transactional
    public IssuedTokenPair issueFor(Long userId) {
        JwtSubject subject = resolveActiveSubject(userId);
        return createSession(subject, clock.instant());
    }

    /**
     * Atomically consumes one refresh token and creates its replacement.
     * Reuse of a previously revoked credential is treated as token theft and
     * revokes the user's remaining active sessions.
     */
    @Transactional(noRollbackFor = {InvalidRefreshTokenException.class, InactiveIdentityException.class})
    public IssuedTokenPair refresh(String rawRefreshToken) {
        Instant now = clock.instant();
        String tokenHash = hash(rawRefreshToken);
        RefreshTokenSession existing = refreshTokenStore.lockByTokenHash(tokenHash)
                .orElseThrow(InvalidRefreshTokenException::new);

        if (existing.isRevoked()) {
            refreshTokenStore.revokeAllActiveForUser(existing.userId(), now, now);
            throw new InvalidRefreshTokenException();
        }
        if (existing.isExpired(now)) {
            throw new InvalidRefreshTokenException();
        }

        JwtSubject subject = subjectResolver.findActiveSubject(existing.userId())
                .orElse(null);
        if (subject == null) {
            refreshTokenStore.revokeAllActiveForUser(existing.userId(), now, now);
            throw new InactiveIdentityException();
        }

        refreshTokenStore.revoke(existing.id(), now);
        return createSession(subject, now);
    }

    /**
     * Revokes one current refresh session. Logout is idempotent and never
     * reveals whether an arbitrary token existed.
     */
    @Transactional
    public void revoke(String rawRefreshToken) {
        if (!isRefreshTokenSyntaxValid(rawRefreshToken)) {
            return;
        }
        Instant now = clock.instant();
        String tokenHash = hash(rawRefreshToken);
        refreshTokenStore.lockByTokenHash(tokenHash)
                .filter(session -> !session.isRevoked() && !session.isExpired(now))
                .ifPresent(session -> refreshTokenStore.revoke(session.id(), now));
    }

    /**
     * Invalidates every active refresh session for an account, for example
     * after a password reset or administrative deactivation.
     */
    @Transactional
    public int revokeAllFor(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("user id must be positive");
        }
        Instant now = clock.instant();
        return refreshTokenStore.revokeAllActiveForUser(userId, now, now);
    }

    private IssuedTokenPair createSession(JwtSubject subject, Instant now) {
        IssuedAccessToken accessToken = accessTokenIssuer.issue(subject, now);
        Instant refreshTokenExpiresAt = now.plus(refreshTokenTtl);
        String rawRefreshToken = generateRefreshToken();
        refreshTokenStore.create(subject.userId(), hash(rawRefreshToken), refreshTokenExpiresAt);
        return new IssuedTokenPair(
                accessToken.value(),
                rawRefreshToken,
                accessToken.expiresAt(),
                refreshTokenExpiresAt,
                IssuedTokenPair.BEARER_TOKEN_TYPE
        );
    }

    private JwtSubject resolveActiveSubject(Long userId) {
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("user id must be positive");
        }
        return subjectResolver.findActiveSubject(userId)
                .orElseThrow(InactiveIdentityException::new);
    }

    private String generateRefreshToken() {
        byte[] bytes = new byte[REFRESH_TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hash(String rawToken) {
        if (!isRefreshTokenSyntaxValid(rawToken)) {
            throw new InvalidRefreshTokenException();
        }
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private static boolean isRefreshTokenSyntaxValid(String rawToken) {
        return rawToken != null && rawToken.matches(REFRESH_TOKEN_PATTERN);
    }

    private static Duration requirePositive(Duration value, String field) {
        if (value == null || value.isZero() || value.isNegative()) {
            throw new IllegalArgumentException(field + " must be positive");
        }
        return value;
    }
}
