package com.recruitment.app.modules.identity.application;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TokenSessionServiceTests {

    private static final Instant NOW = Instant.parse("2026-09-29T12:00:00Z");
    private static final Clock CLOCK = Clock.fixed(NOW, ZoneOffset.UTC);
    private static final Duration ACCESS_TTL = Duration.ofMinutes(15);
    private static final Duration REFRESH_TTL = Duration.ofDays(30);

    @Test
    void issuesShortLivedAccessTokenAndStoresOnlyRefreshDigest() {
        FakeRefreshTokenStore store = new FakeRefreshTokenStore();
        TokenSessionService service = service(activeSubjectResolver(), store);

        IssuedTokenPair pair = service.issueFor(42L);

        assertEquals("access-42", pair.accessToken());
        assertEquals(IssuedTokenPair.BEARER_TOKEN_TYPE, pair.tokenType());
        assertEquals(NOW.plus(ACCESS_TTL), pair.accessTokenExpiresAt());
        assertEquals(NOW.plus(REFRESH_TTL), pair.refreshTokenExpiresAt());
        assertTrue(pair.refreshToken().matches("[A-Za-z0-9_-]{43}"));
        assertEquals(1, store.created.size());
        assertNotEquals(pair.refreshToken(), store.created.getFirst().tokenHash());
        assertTrue(store.created.getFirst().tokenHash().matches("[A-Za-z0-9_-]{43}"));
        assertFalse(pair.toString().contains(pair.accessToken()));
        assertFalse(pair.toString().contains(pair.refreshToken()));
    }

    @Test
    void rotatesAnActiveRefreshTokenUnderTheLockedSession() {
        FakeRefreshTokenStore store = new FakeRefreshTokenStore();
        store.locked = Optional.of(session(7L, null, NOW.plus(Duration.ofHours(1))));
        TokenSessionService service = service(activeSubjectResolver(), store);

        IssuedTokenPair pair = service.refresh(rawRefreshToken('a'));

        assertEquals("access-42", pair.accessToken());
        assertEquals(List.of(7L), store.revokedIds);
        assertEquals(1, store.created.size());
        assertEquals(0, store.revokeAllCalls);
    }

    @Test
    void revokedCredentialReuseInvalidatesAllActiveSessions() {
        FakeRefreshTokenStore store = new FakeRefreshTokenStore();
        store.locked = Optional.of(session(7L, NOW.minusSeconds(1), NOW.plus(Duration.ofHours(1))));
        TokenSessionService service = service(activeSubjectResolver(), store);

        assertThrows(InvalidRefreshTokenException.class, () -> service.refresh(rawRefreshToken('b')));

        assertEquals(1, store.revokeAllCalls);
        assertEquals(List.of(42L), store.revokeAllUserIds);
        assertTrue(store.created.isEmpty());
    }

    @Test
    void inactiveAccountDuringRefreshInvalidatesAllSessions() {
        FakeRefreshTokenStore store = new FakeRefreshTokenStore();
        store.locked = Optional.of(session(7L, null, NOW.plus(Duration.ofHours(1))));
        TokenSessionService service = service(userId -> Optional.empty(), store);

        assertThrows(InactiveIdentityException.class, () -> service.refresh(rawRefreshToken('c')));

        assertEquals(1, store.revokeAllCalls);
        assertTrue(store.created.isEmpty());
    }

    @Test
    void expiredCredentialDoesNotDestroyOtherActiveSessions() {
        FakeRefreshTokenStore store = new FakeRefreshTokenStore();
        store.locked = Optional.of(session(7L, null, NOW));
        TokenSessionService service = service(activeSubjectResolver(), store);

        assertThrows(InvalidRefreshTokenException.class, () -> service.refresh(rawRefreshToken('d')));

        assertEquals(0, store.revokeAllCalls);
        assertTrue(store.created.isEmpty());
    }

    @Test
    void logoutIsIdempotentForMissingOrBlankCredential() {
        FakeRefreshTokenStore store = new FakeRefreshTokenStore();
        TokenSessionService service = service(activeSubjectResolver(), store);

        service.revoke(null);
        service.revoke("  ");
        service.revoke("unknown-token");

        assertTrue(store.revokedIds.isEmpty());
    }

    private static TokenSessionService service(JwtSubjectResolver resolver, FakeRefreshTokenStore store) {
        AccessTokenIssuer issuer = (subject, issuedAt) -> new IssuedAccessToken(
                "access-" + subject.userId(),
                issuedAt.plus(ACCESS_TTL)
        );
        return new TokenSessionService(resolver, issuer, store, CLOCK, REFRESH_TTL);
    }

    private static JwtSubjectResolver activeSubjectResolver() {
        return userId -> userId != null && userId == 42L
                ? Optional.of(new JwtSubject(42L, Set.of("ROLE_CANDIDATE")))
                : Optional.empty();
    }

    private static RefreshTokenSession session(Long id, Instant revokedAt, Instant expiresAt) {
        return new RefreshTokenSession(id, 42L, "digest-" + id, expiresAt, revokedAt);
    }

    private static String rawRefreshToken(char value) {
        return String.valueOf(value).repeat(43);
    }

    private record CreatedRefreshToken(Long userId, String tokenHash, Instant expiresAt) {
    }

    private static final class FakeRefreshTokenStore implements RefreshTokenStore {

        private Optional<RefreshTokenSession> locked = Optional.empty();
        private final List<CreatedRefreshToken> created = new ArrayList<>();
        private final List<Long> revokedIds = new ArrayList<>();
        private final List<Long> revokeAllUserIds = new ArrayList<>();
        private int revokeAllCalls;

        @Override
        public Optional<RefreshTokenSession> lockByTokenHash(String tokenHash) {
            return locked;
        }

        @Override
        public void create(Long userId, String tokenHash, Instant expiresAt) {
            created.add(new CreatedRefreshToken(userId, tokenHash, expiresAt));
        }

        @Override
        public void revoke(Long refreshTokenId, Instant revokedAt) {
            revokedIds.add(refreshTokenId);
        }

        @Override
        public int revokeAllActiveForUser(Long userId, Instant revokedAt, Instant now) {
            revokeAllCalls++;
            revokeAllUserIds.add(userId);
            return 1;
        }
    }
}
