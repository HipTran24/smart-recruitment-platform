package com.recruitment.app.modules.identity.api.response;

import java.time.Instant;

/**
 * Tokens are intentionally returned only from authentication/exchange routes.
 * Callers must store the refresh token outside browser-readable URL state.
 */
public record TokenResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        Instant accessTokenExpiresAt,
        Instant refreshTokenExpiresAt
) {
}
