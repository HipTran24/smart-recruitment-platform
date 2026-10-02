package com.recruitment.app.modules.identity.api;

import com.recruitment.app.common.api.error.ApiErrorResponse;
import com.recruitment.app.modules.identity.application.InactiveIdentityException;
import com.recruitment.app.modules.identity.application.InvalidRefreshTokenException;
import com.recruitment.app.modules.identity.application.exception.EmailAlreadyRegisteredException;
import com.recruitment.app.modules.identity.application.exception.IdentityAuthenticationException;
import com.recruitment.app.modules.identity.application.exception.OAuthFeatureUnavailableException;
import com.recruitment.app.modules.identity.application.exception.OAuthIdentityException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Maps identity failures without making the shared API layer depend on Identity. */
@RestControllerAdvice(basePackageClasses = AuthController.class)
public class IdentityApiExceptionHandler {

    @ExceptionHandler({EmailAlreadyRegisteredException.class, DataIntegrityViolationException.class})
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
