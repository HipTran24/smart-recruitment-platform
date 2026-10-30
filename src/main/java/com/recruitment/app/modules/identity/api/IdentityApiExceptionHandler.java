package com.recruitment.app.modules.identity.api;

import com.recruitment.app.common.api.context.RequestContext;
import com.recruitment.app.common.api.error.ApiErrorResponse;
import com.recruitment.app.modules.identity.application.InactiveIdentityException;
import com.recruitment.app.modules.identity.application.InvalidRefreshTokenException;
import com.recruitment.app.modules.identity.application.exception.AuthenticationThrottledException;
import com.recruitment.app.modules.identity.application.exception.EmailAlreadyRegisteredException;
import com.recruitment.app.modules.identity.application.exception.IdentityAuthenticationException;
import com.recruitment.app.modules.identity.application.exception.InvalidCurrentPasswordException;
import com.recruitment.app.modules.identity.application.exception.InvalidPasswordPolicyException;
import com.recruitment.app.modules.identity.application.exception.InvalidResetTokenException;
import com.recruitment.app.modules.identity.application.exception.InvalidVerificationTokenException;
import com.recruitment.app.modules.identity.application.exception.OAuthFeatureUnavailableException;
import com.recruitment.app.modules.identity.application.exception.OAuthIdentityConflictException;
import com.recruitment.app.modules.identity.application.exception.OAuthIdentityException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/** Maps identity failures without making the shared API layer depend on Identity. */
@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice(basePackages = "com.recruitment.app.modules.identity.api")
public class IdentityApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(IdentityApiExceptionHandler.class);

    @ExceptionHandler(AuthenticationThrottledException.class)
    ResponseEntity<ApiErrorResponse> handleThrottled(AuthenticationThrottledException exception) {
        log.warn("Authentication throttled: requestId={}", RequestContext.requestId());
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header("Retry-After", String.valueOf(exception.getRetryAfterSeconds()))
                .body(ApiErrorResponse.of(
                        "TOO_MANY_REQUESTS",
                        exception.getMessage()
                ));
    }

    @ExceptionHandler({EmailAlreadyRegisteredException.class, OAuthIdentityConflictException.class})
    ResponseEntity<ApiErrorResponse> handleConflict(RuntimeException exception) {
        log.warn("Account conflict: requestId={}", RequestContext.requestId());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiErrorResponse.of(
                "CONFLICT",
                "The requested account state already exists."
        ));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ApiErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException exception) {
        String msg = exception.getMessage() != null ? exception.getMessage().toLowerCase() : "";
        if (msg.contains("uk_users_email") || msg.contains("users.email") || msg.contains("user_oauth_identities")) {
            log.warn("Database unique constraint conflict: requestId={}", RequestContext.requestId());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiErrorResponse.of(
                    "CONFLICT",
                    "The requested account state already exists."
            ));
        }
        log.error("Unhandled data integrity violation: requestId={}", RequestContext.requestId(), exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiErrorResponse.of(
                "INTERNAL_ERROR",
                "A database integrity error occurred."
        ));
    }

    @ExceptionHandler(OAuthFeatureUnavailableException.class)
    ResponseEntity<ApiErrorResponse> handleOAuthUnavailable(OAuthFeatureUnavailableException exception) {
        log.warn("OAuth provider not available: requestId={}", RequestContext.requestId());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiErrorResponse.of(
                "OAUTH_NOT_CONFIGURED",
                "This authentication provider is not configured."
        ));
    }

    @ExceptionHandler(InvalidCurrentPasswordException.class)
    ResponseEntity<ApiErrorResponse> handleInvalidCurrentPassword(InvalidCurrentPasswordException exception) {
        log.warn("Current password mismatch: requestId={}", RequestContext.requestId());
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(ApiErrorResponse.of(
                "INVALID_CURRENT_PASSWORD",
                exception.getMessage()
        ));
    }

    @ExceptionHandler(InvalidPasswordPolicyException.class)
    ResponseEntity<ApiErrorResponse> handleInvalidPasswordPolicy(InvalidPasswordPolicyException exception) {
        log.warn("Password policy violation: requestId={}", RequestContext.requestId());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiErrorResponse(
                "VALIDATION_ERROR",
                "The request is invalid.",
                Map.of("newPassword", exception.getMessage())
        ));
    }

    @ExceptionHandler({
            InvalidResetTokenException.class,
            InvalidVerificationTokenException.class
    })
    ResponseEntity<ApiErrorResponse> handleBadRequestTokens(RuntimeException exception) {
        log.warn("Invalid token provided: requestId={}", RequestContext.requestId());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiErrorResponse.of(
                "INVALID_REQUEST",
                exception.getMessage()
        ));
    }

    @ExceptionHandler({
            IdentityAuthenticationException.class,
            InvalidRefreshTokenException.class,
            InactiveIdentityException.class,
            OAuthIdentityException.class
    })
    ResponseEntity<ApiErrorResponse> handleAuthenticationFailure(RuntimeException exception) {
        log.warn("Authentication failure: requestId={}", RequestContext.requestId());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiErrorResponse.of(
                "AUTHENTICATION_FAILED",
                "Authentication failed."
        ));
    }
}
