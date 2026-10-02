package com.recruitment.app.modules.identity.application.command;

/**
 * Verified claims extracted from Google's OpenID Connect user-info response.
 */
public record GoogleIdentityProfile(
        String subject,
        String email,
        boolean emailVerified,
        String displayName
) {
}
