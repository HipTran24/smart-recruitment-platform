package com.recruitment.app.modules.identity.api.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record OAuthCodeExchangeRequest(
        @NotBlank
        @Pattern(regexp = "[A-Za-z0-9_-]{43}")
        String code,
        @NotBlank
        @Pattern(regexp = "[A-Za-z0-9\\-._~]{43,128}")
        String codeVerifier,
        @NotBlank
        @Pattern(regexp = "[A-Za-z0-9_-]{43}")
        String transactionId
) {
}
