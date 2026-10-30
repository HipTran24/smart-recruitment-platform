package com.recruitment.app.modules.identity.application;

/**
 * A deliberately non-descriptive error for expired, revoked, malformed, or
 * unknown refresh credentials. HTTP adapters must map it to one generic 401
 * response and must never echo the submitted token.
 */
public final class InvalidRefreshTokenException extends RuntimeException {

    public InvalidRefreshTokenException() {
        super("Refresh token is invalid or expired");
    }
}
