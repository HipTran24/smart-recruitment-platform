package com.recruitment.app.modules.identity.application;

import java.time.Instant;
import java.util.Optional;

/**
 * Transactional persistence port for opaque refresh sessions.
 */
public interface RefreshTokenStore {

    /**
     * Returns and locks one refresh session for a single-use rotation.
     */
    Optional<RefreshTokenSession> lockByTokenHash(String tokenHash);

    void create(Long userId, String tokenHash, Instant expiresAt);

    /**
     * Revokes an active token identified by its durable identifier.
     */
    void revoke(Long refreshTokenId, Instant revokedAt);

    int revokeAllActiveForUser(Long userId, Instant revokedAt, Instant now);
}
