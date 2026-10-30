package com.recruitment.app.modules.identity.application.exception;

/**
 * Thrown when a password does not satisfy domain policy complexity/length requirements.
 */
public class InvalidPasswordPolicyException extends RuntimeException {

    public InvalidPasswordPolicyException(String message) {
        super(message);
    }
}
