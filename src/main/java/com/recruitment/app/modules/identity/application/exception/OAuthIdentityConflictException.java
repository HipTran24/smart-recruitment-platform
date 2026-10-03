package com.recruitment.app.modules.identity.application.exception;

public class OAuthIdentityConflictException extends RuntimeException {

    public OAuthIdentityConflictException(String message) {
        super(message);
    }
}
