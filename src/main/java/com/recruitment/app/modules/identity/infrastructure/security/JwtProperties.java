package com.recruitment.app.modules.identity.infrastructure.security;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.core.io.Resource;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

/**
 * Runtime-only JWT configuration. Key material is read from a mounted secret
 * resource, never from source control or a database column.
 */
@Validated
@ConfigurationProperties(prefix = "app.security.jwt")
public record JwtProperties(
        String issuer,
        String audience,
        String keyId,
        Resource privateKeyLocation,
        Resource publicKeyLocation,
        Duration accessTokenTtl,
        Duration refreshTokenTtl,
        Duration clockSkew
) {

    private static final Duration MAX_ACCESS_TOKEN_TTL = Duration.ofMinutes(30);
    private static final Duration MIN_REFRESH_TOKEN_TTL = Duration.ofHours(1);
    private static final Duration MAX_REFRESH_TOKEN_TTL = Duration.ofDays(90);
    private static final Duration MAX_CLOCK_SKEW = Duration.ofMinutes(1);

    public JwtProperties {
        issuer = requireText(issuer, "issuer");
        audience = requireText(audience, "audience");
        keyId = requireText(keyId, "key id");
        if (privateKeyLocation == null) {
            throw new IllegalArgumentException("private key location must not be null");
        }
        if (publicKeyLocation == null) {
            throw new IllegalArgumentException("public key location must not be null");
        }
        accessTokenTtl = requireInRange(
                accessTokenTtl,
                Duration.ofSeconds(30),
                MAX_ACCESS_TOKEN_TTL,
                "access token TTL"
        );
        refreshTokenTtl = requireInRange(
                refreshTokenTtl,
                MIN_REFRESH_TOKEN_TTL,
                MAX_REFRESH_TOKEN_TTL,
                "refresh token TTL"
        );
        if (!refreshTokenTtl.minus(accessTokenTtl).isPositive()) {
            throw new IllegalArgumentException("refresh token TTL must exceed access token TTL");
        }
        clockSkew = requireInRange(clockSkew, Duration.ZERO, MAX_CLOCK_SKEW, "clock skew");
    }

    private static String requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " must not be blank");
        }
        return value.strip();
    }

    private static Duration requireInRange(Duration value, Duration min, Duration max, String field) {
        if (value == null || value.compareTo(min) < 0 || value.compareTo(max) > 0) {
            throw new IllegalArgumentException(field + " must be between " + min + " and " + max);
        }
        return value;
    }
}
