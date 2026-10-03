package com.recruitment.app.modules.identity.domain.model;

import java.time.Instant;

/**
 * Domain snapshot of an issued OAuth authorization handoff code.
 */
public record OAuthCodeSnapshot(
        Long id,
        Long userId,
        String codeHash,
        String codeChallenge,
        String transactionId,
        Instant expiresAt,
        Instant consumedAt
) {
    public boolean isUsable(Instant now) {
        return consumedAt == null && expiresAt != null && now.isBefore(expiresAt);
    }
}
