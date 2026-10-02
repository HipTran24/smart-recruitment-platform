package com.recruitment.app.common.api.error;

import java.util.Map;

/**
 * Stable, intentionally non-diagnostic error contract for public JSON APIs.
 */
public record ApiErrorResponse(String code, String message, Map<String, String> fieldErrors) {

    public static ApiErrorResponse of(String code, String message) {
        return new ApiErrorResponse(code, message, Map.of());
    }
}
