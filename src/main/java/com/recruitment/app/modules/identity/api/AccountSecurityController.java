package com.recruitment.app.modules.identity.api;

import com.recruitment.app.modules.identity.api.request.ChangePasswordRequest;
import com.recruitment.app.modules.identity.api.request.PasswordResetConfirmRequest;
import com.recruitment.app.modules.identity.api.request.PasswordResetRequest;
import com.recruitment.app.modules.identity.api.request.VerifyEmailRequest;
import com.recruitment.app.modules.identity.application.EmailVerificationService;
import com.recruitment.app.modules.identity.application.PasswordManagementService;
import com.recruitment.app.modules.identity.application.exception.IdentityAuthenticationException;
import com.recruitment.app.modules.identity.infrastructure.security.JwtPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AccountSecurityController {

    private final PasswordManagementService passwordManagement;
    private final EmailVerificationService emailVerification;

    public AccountSecurityController(
            PasswordManagementService passwordManagement,
            EmailVerificationService emailVerification
    ) {
        this.passwordManagement = passwordManagement;
        this.emailVerification = emailVerification;
    }

    @PostMapping("/password/change")
    public ResponseEntity<Void> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtPrincipal principal)) {
            throw new IdentityAuthenticationException();
        }
        passwordManagement.changePassword(principal.userId(), request.currentPassword(), request.newPassword());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/password/reset-request")
    public ResponseEntity<Map<String, String>> requestPasswordReset(
            @Valid @RequestBody PasswordResetRequest request
    ) {
        passwordManagement.requestPasswordReset(request.email());
        return ResponseEntity.ok(Map.of(
                "message", "If an active account exists with this email, a reset token has been dispatched."
        ));
    }

    @PostMapping("/password/reset-confirm")
    public ResponseEntity<Void> confirmPasswordReset(
            @Valid @RequestBody PasswordResetConfirmRequest request
    ) {
        passwordManagement.confirmPasswordReset(request.token(), request.newPassword());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(
            @Valid @RequestBody VerifyEmailRequest request
    ) {
        emailVerification.verifyEmail(request.token());
        return ResponseEntity.noContent().build();
    }
}
