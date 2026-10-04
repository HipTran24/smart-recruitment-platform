package com.recruitment.app.modules.applications.application.screening;

import java.util.Objects;
import java.util.regex.Pattern;

/**
 * A bounded, non-sensitive failure record that is safe to persist. Provider messages and generic
 * exception messages are intentionally not copied because they can contain raw resume content,
 * credentials, or other operational detail.
 */
public record CvScreeningFailure(String code, boolean retryable, String message) {

    private static final int MAX_MESSAGE_LENGTH = 1_000;
    private static final Pattern CODE_PATTERN = Pattern.compile("^[A-Z][A-Z0-9_]{1,63}$");

    public CvScreeningFailure {
        if (code == null || !CODE_PATTERN.matcher(code).matches()) {
            throw new IllegalArgumentException("CV screening failure code is invalid");
        }
        message = boundedMessage(message);
    }

    public static CvScreeningFailure inputFingerprintMismatch() {
        return new CvScreeningFailure(
                "INPUT_FINGERPRINT_MISMATCH",
                false,
                "The screening input did not match the queued screening fingerprint."
        );
    }

    public static CvScreeningFailure providerNotConfigured() {
        return new CvScreeningFailure(
                "PROVIDER_NOT_CONFIGURED",
                false,
                "The CV screening provider is not configured for this deployment."
        );
    }

    public static CvScreeningFailure applicationNotEligible() {
        return new CvScreeningFailure(
                "APPLICATION_NOT_ELIGIBLE",
                false,
                "The application is no longer eligible for CV screening."
        );
    }

    public static CvScreeningFailure from(CvScreeningException exception) {
        Objects.requireNonNull(exception, "CV screening exception must not be null");
        return switch (exception.getReason()) {
            case NOT_CONFIGURED -> providerNotConfigured();
            case INVALID_INPUT -> new CvScreeningFailure(
                    "INVALID_SCREENING_INPUT",
                    false,
                    "The CV screening input is invalid."
            );
            case PROVIDER_REJECTED -> new CvScreeningFailure(
                    "PROVIDER_REJECTED",
                    false,
                    "The CV screening provider rejected the request."
            );
            case PROVIDER_UNAVAILABLE -> new CvScreeningFailure(
                    "PROVIDER_UNAVAILABLE",
                    exception.isRetryable(),
                    "The CV screening provider is temporarily unavailable."
            );
            case INVALID_PROVIDER_RESPONSE -> new CvScreeningFailure(
                    "INVALID_PROVIDER_RESPONSE",
                    false,
                    "The CV screening provider returned an invalid response."
            );
        };
    }

    public static CvScreeningFailure unexpectedProviderFailure() {
        return new CvScreeningFailure(
                "UNEXPECTED_PROVIDER_FAILURE",
                true,
                "The CV screening provider could not complete the request."
        );
    }

    private static String boundedMessage(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("CV screening failure message must not be blank");
        }
        String normalized = value
                .replaceAll("[\\p{Cntrl}&&[^\\r\\n\\t]]", " ")
                .replaceAll("[\\r\\n\\t]+", " ")
                .replaceAll("\\s+", " ")
                .strip();
        if (normalized.length() > MAX_MESSAGE_LENGTH) {
            return normalized.substring(0, MAX_MESSAGE_LENGTH).strip();
        }
        return normalized;
    }
}
