package com.recruitment.app.modules.identity.application;

import com.recruitment.app.modules.identity.application.exception.OAuthIdentityException;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Exchanges one opaque browser handoff code for the normal JWT/refresh-token
 * pair. It is deliberately separate from the OAuth callback handler.
 */
@Service
@ConditionalOnProperty(prefix = "app.security.oauth2.google", name = "enabled", havingValue = "true")
public class GoogleOAuthCodeExchangeService {

    private final OAuthAuthorizationCodeService authorizationCodes;
    private final TokenSessionService tokenSessions;

    public GoogleOAuthCodeExchangeService(
            OAuthAuthorizationCodeService authorizationCodes,
            TokenSessionService tokenSessions
    ) {
        this.authorizationCodes = authorizationCodes;
        this.tokenSessions = tokenSessions;
    }

    @Transactional(noRollbackFor = {OAuthIdentityException.class, InactiveIdentityException.class})
    public IssuedTokenPair exchange(String rawCode, String codeVerifier, String transactionId) {
        Long userId = authorizationCodes.consume(rawCode, codeVerifier, transactionId);
        return tokenSessions.issueFor(userId);
    }
}
