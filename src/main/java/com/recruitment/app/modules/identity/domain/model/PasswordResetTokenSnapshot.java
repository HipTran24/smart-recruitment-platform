package com.recruitment.app.modules.identity.domain.model;

import java.time.Instant;

public record PasswordResetTokenSnapshot(Long id, Long userId, String tokenHash, Instant expiresAt, boolean consumed) {
    public boolean isExpired(Instant now) {
        return now.isAfter(expiresAt);
    }
}
