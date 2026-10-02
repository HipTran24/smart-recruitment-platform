package com.recruitment.app.modules.identity.application.exception;

public class EmailAlreadyRegisteredException extends RuntimeException {

    public EmailAlreadyRegisteredException() {
        super("An account already uses this email address");
    }
}
