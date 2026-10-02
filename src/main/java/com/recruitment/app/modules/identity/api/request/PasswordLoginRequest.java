package com.recruitment.app.modules.identity.api.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordLoginRequest(
        @NotBlank @Email @Size(max = 255) String email,
        @NotBlank @Size(max = 128) String password
) {
}
