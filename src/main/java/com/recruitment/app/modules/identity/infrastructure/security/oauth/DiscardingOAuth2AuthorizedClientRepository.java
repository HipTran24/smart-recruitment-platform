package com.recruitment.app.modules.identity.infrastructure.security.oauth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizedClientRepository;

/**
 * Google access/refresh tokens are unnecessary for sign-in and must not be
 * retained in an HTTP session or application memory after OIDC verification.
 */
public final class DiscardingOAuth2AuthorizedClientRepository implements OAuth2AuthorizedClientRepository {

    public static final DiscardingOAuth2AuthorizedClientRepository INSTANCE = new DiscardingOAuth2AuthorizedClientRepository();

    private DiscardingOAuth2AuthorizedClientRepository() {
    }

    @Override
    public <T extends OAuth2AuthorizedClient> T loadAuthorizedClient(
            String clientRegistrationId,
            Authentication principal,
            HttpServletRequest request
    ) {
        return null;
    }

    @Override
    public void saveAuthorizedClient(
            OAuth2AuthorizedClient authorizedClient,
            Authentication principal,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        // Login uses OIDC claims immediately; provider credentials are discarded.
    }

    @Override
    public void removeAuthorizedClient(
            String clientRegistrationId,
            Authentication principal,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        // Nothing is retained.
    }
}
