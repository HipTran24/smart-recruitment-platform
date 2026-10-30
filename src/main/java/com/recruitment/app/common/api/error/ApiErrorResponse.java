package com.recruitment.app.common.api.error;

import java.util.Map;
import com.recruitment.app.common.api.context.RequestContext;

/**
 * Stable, intentionally non-diagnostic error contract for public JSON APIs.
 */
public record ApiErrorResponse(String code, String message, Map<String, String> fieldErrors, String requestId) {

    public ApiErrorResponse(String code, String message, Map<String, String> fieldErrors) {
        this(code, message, fieldErrors, RequestContext.requestId());
    }

    public static ApiErrorResponse of(String code, String message) {
        return new ApiErrorResponse(code, message, Map.of());
    }
}
