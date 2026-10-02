package com.recruitment.app.modules.identity.infrastructure.security;

/**
 * Safe wrapper for any rejected application bearer token.
 */
public final class InvalidAccessTokenException extends RuntimeException {

    public InvalidAccessTokenException() {
        super("Access token is invalid or expired");
    }

    InvalidAccessTokenException(Throwable cause) {
        super("Access token is invalid or expired", cause);
    }
}
