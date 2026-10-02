package com.recruitment.app.modules.identity.api.response;

import java.time.Instant;

public record OAuthAuthorizationCodeResponse(String code, String transactionId, Instant expiresAt) {
}
