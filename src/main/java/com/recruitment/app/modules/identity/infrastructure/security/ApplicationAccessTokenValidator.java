package com.recruitment.app.modules.identity.infrastructure.security;

import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;
import java.util.Objects;

/**
 * Enforces application-specific JWT claims in addition to signature,
 * timestamps, and issuer validation performed by the decoder.
 */
final class ApplicationAccessTokenValidator implements OAuth2TokenValidator<Jwt> {

    static final String TOKEN_USE_CLAIM = "token_use";
    static final String ACCESS_TOKEN_USE = "access";
    static final String ROLES_CLAIM = "roles";
    private static final String JWT_TYPE = "JWT";

    private static final OAuth2Error INVALID_TOKEN = new OAuth2Error(
            "invalid_token",
            "The token is not a valid application access token.",
            null
    );

    private final String expectedAudience;

    ApplicationAccessTokenValidator(String expectedAudience) {
        this.expectedAudience = Objects.requireNonNull(expectedAudience, "expected audience must not be null");
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt token) {
        try {
            if (!JWT_TYPE.equals(token.getHeaders().get("typ"))
                    || !token.getAudience().contains(expectedAudience)
                    || !ACCESS_TOKEN_USE.equals(token.getClaimAsString(TOKEN_USE_CLAIM))
                    || !isPositiveIdentifier(token.getSubject())
                    || isBlank(token.getId())
                    || !hasValidRoles(token.getClaimAsStringList(ROLES_CLAIM))) {
                return OAuth2TokenValidatorResult.failure(INVALID_TOKEN);
            }
            return OAuth2TokenValidatorResult.success();
        } catch (RuntimeException exception) {
            return OAuth2TokenValidatorResult.failure(INVALID_TOKEN);
        }
    }

    private static boolean isPositiveIdentifier(String value) {
        if (isBlank(value)) {
            return false;
        }
        try {
            return Long.parseLong(value) > 0;
        } catch (NumberFormatException exception) {
            return false;
        }
    }

    private static boolean hasValidRoles(List<String> roleCodes) {
        if (roleCodes == null || roleCodes.isEmpty()) {
            return false;
        }
        return roleCodes.stream().allMatch(role -> role != null && role.matches("ROLE_[A-Z0-9_]{1,45}"));
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
