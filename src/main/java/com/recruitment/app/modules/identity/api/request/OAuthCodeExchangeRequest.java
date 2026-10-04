package com.recruitment.app.modules.identity.api.request;

import com.recruitment.app.common.security.TokenDigest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record OAuthCodeExchangeRequest(
        @NotBlank
        @Pattern(regexp = TokenDigest.OPAQUE_TOKEN_REGEX)
        String code,
        @NotBlank
        @Pattern(regexp = TokenDigest.PKCE_CODE_VERIFIER_REGEX)
        String codeVerifier,
        @NotBlank
        @Pattern(regexp = TokenDigest.FLEXIBLE_TOKEN_REGEX)
        String transactionId
) {
}
