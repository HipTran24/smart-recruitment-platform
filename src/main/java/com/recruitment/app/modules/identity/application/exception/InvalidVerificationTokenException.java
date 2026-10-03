package com.recruitment.app.modules.identity.application.exception;

public class InvalidVerificationTokenException extends RuntimeException {

    public InvalidVerificationTokenException() {
        super("Email verification token is invalid, expired, or already used.");
    }
}
