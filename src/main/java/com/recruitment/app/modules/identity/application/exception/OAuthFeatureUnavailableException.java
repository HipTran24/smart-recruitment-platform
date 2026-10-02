package com.recruitment.app.modules.identity.application.exception;

public class OAuthFeatureUnavailableException extends RuntimeException {

    public OAuthFeatureUnavailableException() {
        super("Google OAuth is not configured for this deployment");
    }
}
