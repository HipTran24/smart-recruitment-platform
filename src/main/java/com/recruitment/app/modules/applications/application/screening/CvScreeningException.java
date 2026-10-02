package com.recruitment.app.modules.applications.application.screening;

/**
 * A sanitized failure from a CV screening provider. Its message is intentionally safe to expose to
 * application logs; raw CV content, API credentials, and provider response bodies are excluded.
 */
public final class CvScreeningException extends RuntimeException {

    private final Reason reason;
    private final boolean retryable;

    public CvScreeningException(Reason reason, boolean retryable, String message) {
        super(message);
        this.reason = reason;
        this.retryable = retryable;
    }

    public CvScreeningException(Reason reason, boolean retryable, String message, Throwable cause) {
        super(message, cause);
        this.reason = reason;
        this.retryable = retryable;
    }

    public Reason getReason() {
        return reason;
    }

    public boolean isRetryable() {
        return retryable;
    }

    public enum Reason {
        NOT_CONFIGURED,
        INVALID_INPUT,
        PROVIDER_REJECTED,
        PROVIDER_UNAVAILABLE,
        INVALID_PROVIDER_RESPONSE
    }
}
