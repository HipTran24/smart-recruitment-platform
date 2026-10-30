package com.recruitment.app.modules.identity.application.exception;

public class AuthenticationThrottledException extends RuntimeException {

    private final long retryAfterSeconds;

    public AuthenticationThrottledException() {
        this(900L);
    }

    public AuthenticationThrottledException(long retryAfterSeconds) {
        super("Too many failed attempts. Please try again later.");
        this.retryAfterSeconds = Math.max(1L, retryAfterSeconds);
    }

    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}
