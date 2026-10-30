package com.recruitment.app.modules.identity.application.exception;

public class InvalidResetTokenException extends RuntimeException {

    public InvalidResetTokenException() {
        super("Password reset token is invalid, expired, or already used.");
    }
}
