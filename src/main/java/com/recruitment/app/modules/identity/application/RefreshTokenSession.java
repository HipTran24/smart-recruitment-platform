package com.recruitment.app.modules.identity.application;

import java.time.Instant;
import java.util.Objects;

/**
 * Persistence-neutral representation of a server-side refresh session.
 */
public record RefreshTokenSession(
        Long id,
        Long userId,
        String tokenHash,
        Instant expiresAt,
        Instant revokedAt
) {

    public RefreshTokenSession {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("refresh token id must be positive");
        }
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("user id must be positive");
        }
        if (tokenHash == null || tokenHash.isBlank()) {
            throw new IllegalArgumentException("token hash must not be blank");
        }
        expiresAt = Objects.requireNonNull(expiresAt, "refresh token expiry must not be null");
    }

    public boolean isExpired(Instant now) {
        return !expiresAt.isAfter(Objects.requireNonNull(now, "now must not be null"));
    }

    public boolean isRevoked() {
        return revokedAt != null;
    }
}
