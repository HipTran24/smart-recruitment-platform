package com.recruitment.app.common.api.error;

import com.recruitment.app.common.api.context.RequestContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@Order(Ordered.LOWEST_PRECEDENCE)
@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException exception) {
        log.warn("Validation error on request: requestId={}", RequestContext.requestId());
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError error : exception.getBindingResult().getFieldErrors()) {
            fieldErrors.putIfAbsent(error.getField(), error.getDefaultMessage());
        }
        return ResponseEntity.badRequest().body(new ApiErrorResponse(
                "VALIDATION_ERROR",
                "The request is invalid.",
                Map.copyOf(fieldErrors)
        ));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ApiErrorResponse> handleMessageNotReadable(HttpMessageNotReadableException exception) {
        log.warn("Malformed HTTP message: requestId={}", RequestContext.requestId());
        Throwable cause = exception.getCause();
        if (cause instanceof tools.jackson.databind.exc.UnrecognizedPropertyException upe) {
            String property = upe.getPropertyName();
            return ResponseEntity.badRequest().body(new ApiErrorResponse(
                    "VALIDATION_ERROR",
                    "The request contains unrecognized properties.",
                    Map.of(property, "Unrecognized field: " + property)
            ));
        }
        return ResponseEntity.badRequest().body(ApiErrorResponse.of(
                "INVALID_REQUEST",
                "The request is invalid."
        ));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<ApiErrorResponse> handleIllegalArgument(IllegalArgumentException exception) {
        log.warn("Illegal argument error: requestId={}", RequestContext.requestId());
        return ResponseEntity.badRequest().body(ApiErrorResponse.of(
                "INVALID_REQUEST",
                "The request is invalid."
        ));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiErrorResponse> handleUnexpected(Exception exception) {
        log.error("Unhandled unexpected exception: requestId={}", RequestContext.requestId(), exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiErrorResponse.of(
                "INTERNAL_ERROR",
                "An unexpected internal error occurred."
        ));
    }
}
