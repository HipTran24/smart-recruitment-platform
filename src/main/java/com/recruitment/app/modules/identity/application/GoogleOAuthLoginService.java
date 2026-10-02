package com.recruitment.app.modules.identity.application;

import com.recruitment.app.modules.identity.application.command.GoogleIdentityProfile;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Coordinates provider identity resolution and authorization-code issuance as
 * one transaction, so a browser can exchange the handoff code exactly once.
 */
@Service
@ConditionalOnProperty(prefix = "app.security.oauth2.google", name = "enabled", havingValue = "true")
public class GoogleOAuthLoginService {

    private final IdentityAuthenticationService identities;
    private final OAuthAuthorizationCodeService authorizationCodes;

    public GoogleOAuthLoginService(
            IdentityAuthenticationService identities,
            OAuthAuthorizationCodeService authorizationCodes
    ) {
        this.identities = identities;
        this.authorizationCodes = authorizationCodes;
    }

    @Transactional
    public OAuthAuthorizationCodeService.IssuedAuthorizationCode complete(
            GoogleIdentityProfile profile,
            String codeChallenge,
            String transactionId
    ) {
        Long userId = identities.resolveGoogleAccount(profile);
        return authorizationCodes.issueFor(userId, codeChallenge, transactionId);
    }
}
