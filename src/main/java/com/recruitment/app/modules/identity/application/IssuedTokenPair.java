package com.recruitment.app.modules.identity.application;

import java.time.Instant;
import java.util.Objects;

/**
 * A one-time transport object for credentials returned after authentication or
 * refresh-token rotation. Never log this object: its string representation is
 * intentionally redacted.
 */
public record IssuedTokenPair(
        String accessToken,
        String refreshToken,
        Instant accessTokenExpiresAt,
        Instant refreshTokenExpiresAt,
        String tokenType
) {

    public static final String BEARER_TOKEN_TYPE = "Bearer";

    public IssuedTokenPair {
        accessToken = requireToken(accessToken, "access token");
        refreshToken = requireToken(refreshToken, "refresh token");
        accessTokenExpiresAt = Objects.requireNonNull(accessTokenExpiresAt, "access token expiry must not be null");
        refreshTokenExpiresAt = Objects.requireNonNull(refreshTokenExpiresAt, "refresh token expiry must not be null");
        if (!refreshTokenExpiresAt.isAfter(accessTokenExpiresAt)) {
            throw new IllegalArgumentException("refresh token must outlive access token");
        }
        if (!BEARER_TOKEN_TYPE.equals(tokenType)) {
            throw new IllegalArgumentException("token type must be Bearer");
        }
    }

    @Override
    public String toString() {
        return "IssuedTokenPair[accessToken=<redacted>, refreshToken=<redacted>, accessTokenExpiresAt="
                + accessTokenExpiresAt
                + ", refreshTokenExpiresAt="
                + refreshTokenExpiresAt
                + ", tokenType="
                + tokenType
                + "]";
    }

    private static String requireToken(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " must not be blank");
        }
        return value;
    }
}
