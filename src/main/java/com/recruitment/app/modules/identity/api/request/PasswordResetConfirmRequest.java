package com.recruitment.app.modules.identity.api.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordResetConfirmRequest(
        @NotBlank(message = "Reset token is required")
        String token,

        @NotBlank(message = "New password is required")
        @Size(min = 12, max = 128, message = "New password must be between 12 and 128 characters")
        String newPassword
) {}
