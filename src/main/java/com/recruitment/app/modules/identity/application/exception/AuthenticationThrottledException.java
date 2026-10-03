package com.recruitment.app.modules.identity.application.exception;

public class AuthenticationThrottledException extends RuntimeException {

    public AuthenticationThrottledException() {
        super("Too many failed attempts. Please try again later.");
    }
}
