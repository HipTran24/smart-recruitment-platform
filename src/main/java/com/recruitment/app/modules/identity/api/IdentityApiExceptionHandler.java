package com.recruitment.app.modules.identity.api;

import com.recruitment.app.common.api.error.ApiErrorResponse;
import com.recruitment.app.modules.identity.application.InactiveIdentityException;
import com.recruitment.app.modules.identity.application.InvalidRefreshTokenException;
import com.recruitment.app.modules.identity.application.exception.AuthenticationThrottledException;
import com.recruitment.app.modules.identity.application.exception.EmailAlreadyRegisteredException;
import com.recruitment.app.modules.identity.application.exception.IdentityAuthenticationException;
import com.recruitment.app.modules.identity.application.exception.InvalidCurrentPasswordException;
import com.recruitment.app.modules.identity.application.exception.InvalidResetTokenException;
import com.recruitment.app.modules.identity.application.exception.InvalidVerificationTokenException;
import com.recruitment.app.modules.identity.application.exception.OAuthFeatureUnavailableException;
import com.recruitment.app.modules.identity.application.exception.OAuthIdentityConflictException;
import com.recruitment.app.modules.identity.application.exception.OAuthIdentityException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Maps identity failures without making the shared API layer depend on Identity. */
@RestControllerAdvice(basePackages = "com.recruitment.app.modules.identity.api")
public class IdentityApiExceptionHandler {

    @ExceptionHandler(AuthenticationThrottledException.class)
    ResponseEntity<ApiErrorResponse> handleThrottled(AuthenticationThrottledException exception) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(ApiErrorResponse.of(
                "TOO_MANY_REQUESTS",
                exception.getMessage()
        ));
    }

    @ExceptionHandler({EmailAlreadyRegisteredException.class, OAuthIdentityConflictException.class, DataIntegrityViolationException.class})
    ResponseEntity<ApiErrorResponse> handleConflict(RuntimeException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiErrorResponse.of(
                "CONFLICT",
                "The requested account state already exists."
        ));
    }

    @ExceptionHandler(OAuthFeatureUnavailableException.class)
    ResponseEntity<ApiErrorResponse> handleOAuthUnavailable(OAuthFeatureUnavailableException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiErrorResponse.of(
                "OAUTH_NOT_CONFIGURED",
                "This authentication provider is not configured."
        ));
    }

    @ExceptionHandler({
            InvalidResetTokenException.class,
            InvalidVerificationTokenException.class,
            InvalidCurrentPasswordException.class
    })
    ResponseEntity<ApiErrorResponse> handleBadRequestTokens(RuntimeException exception) {
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
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiErrorResponse.of(
                "AUTHENTICATION_FAILED",
                "Authentication failed."
        ));
    }
}
