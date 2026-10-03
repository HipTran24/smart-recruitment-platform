package com.recruitment.app.modules.identity.application.exception;

public class InvalidCurrentPasswordException extends RuntimeException {

    public InvalidCurrentPasswordException() {
        super("Current password does not match.");
    }
}
