package com.recruitment.app.modules.identity.application;

import java.time.Instant;
import java.util.Objects;

/**
 * Signed short-lived credential. The value is intentionally redacted in logs.
 */
public record IssuedAccessToken(String value, Instant expiresAt) {

    public IssuedAccessToken {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("access token must not be blank");
        }
        expiresAt = Objects.requireNonNull(expiresAt, "access token expiry must not be null");
    }

    @Override
    public String toString() {
        return "IssuedAccessToken[value=<redacted>, expiresAt=" + expiresAt + "]";
    }
}
