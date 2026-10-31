package com.recruitment.app.modules.applications.application.screening;

/**
 * A sanitized failure from a CV screening provider. Its message is intentionally safe to expose to
 * application logs; raw CV content, API credentials, and provider response bodies are excluded.
 */
public final class CvScreeningException extends RuntimeException {

    private final Reason reason;
    private final boolean retryable;
    private final java.time.Duration retryAfter;

    public CvScreeningException(Reason reason, boolean retryable, String message) {
        super(message);
        this.reason = reason;
        this.retryable = retryable;
        this.retryAfter = null;
    }

    public CvScreeningException(Reason reason, boolean retryable, String message, Throwable cause) {
        super(message, cause);
        this.reason = reason;
        this.retryable = retryable;
        this.retryAfter = null;
    }

    public CvScreeningException(Reason reason, java.time.Duration retryAfter) {
        super("CV screening provider requested a cooldown");
        this.reason = reason;
        this.retryable = true;
        this.retryAfter = retryAfter;
    }

    public java.time.Duration getRetryAfter() { return retryAfter; }

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
        QUOTA_EXHAUSTED,
        PAYMENT_REQUIRED,
        INVALID_PROVIDER_RESPONSE
    }
}
