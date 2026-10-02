package com.recruitment.app.modules.identity.application;

/**
 * Raised when an account is no longer eligible to receive credentials.
 */
public final class InactiveIdentityException extends RuntimeException {

    public InactiveIdentityException() {
        super("Identity is inactive or unavailable");
    }
}
