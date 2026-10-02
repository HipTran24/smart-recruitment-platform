package com.recruitment.app.modules.identity.application.exception;

/**
 * Deliberately generic authentication failure. Its public representation must
 * not reveal whether a particular account exists or is inactive.
 */
public class IdentityAuthenticationException extends RuntimeException {

    public IdentityAuthenticationException() {
        super("Authentication failed");
    }
}
