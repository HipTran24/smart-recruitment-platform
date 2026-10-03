package com.recruitment.app.modules.identity.infrastructure.security;

/**
 * Validates that an authenticated identity remains active and that its
 * issued credential version matches current database state.
 */
public interface LiveAccountValidator {
    boolean isAccountLive(Long userId, int expectedCredentialVersion);
}
