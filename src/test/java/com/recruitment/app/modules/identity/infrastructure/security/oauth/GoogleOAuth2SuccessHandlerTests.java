package com.recruitment.app.modules.identity.infrastructure.security.oauth;

import com.recruitment.app.modules.identity.application.GoogleOAuthLoginService;
import com.recruitment.app.modules.identity.application.OAuthAuthorizationCodeService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;

import tools.jackson.databind.ObjectMapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class GoogleOAuth2SuccessHandlerTests {

    @Test
    void redirectsWithOneTimeCodeRatherThanJwt() throws Exception {
        GoogleOAuthLoginService loginService = mock(GoogleOAuthLoginService.class);
        String code = "a".repeat(43);
        String transactionId = "t".repeat(43);
        when(loginService.complete(any(), any(), any())).thenReturn(new OAuthAuthorizationCodeService.IssuedAuthorizationCode(
                code,
                transactionId,
                Instant.parse("2026-09-29T00:01:00Z")
        ));
        GoogleOAuth2SuccessHandler handler = new GoogleOAuth2SuccessHandler(
                loginService,
                new GoogleOAuthProperties(
                        true,
                        "client-id",
                        "client-secret",
                        "https://app.example.test/auth/complete?source=google",
                        Duration.ofMinutes(1)
                ),
                mock(ObjectMapper.class)
        );
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpSession session = new MockHttpSession();
        request.setSession(session);
        assertTrue(PkceGoogleAuthorizationRequestFilter.registerPendingTransaction(
                request,
                transactionId,
                "b".repeat(43)
        ));
        request.setAttribute(
                TransactionBoundOAuth2AuthorizationRequestRepository.CALLBACK_TRANSACTION_ID_ATTRIBUTE,
                transactionId
        );
        MockHttpServletResponse response = new MockHttpServletResponse();

        handler.onAuthenticationSuccess(request, response, googleAuthentication(true));

        assertEquals(302, response.getStatus());
        assertEquals("https://app.example.test/auth/complete?source=google&code=" + code
                        + "&transaction_id=" + transactionId,
                response.getRedirectedUrl());
        assertEquals("no-store, max-age=0", response.getHeader("Cache-Control"));
        assertEquals("no-referrer", response.getHeader("Referrer-Policy"));
        verify(loginService).complete(any(), eq("b".repeat(43)), eq(transactionId));
    }

    @Test
    void rejectsAnUnverifiedGoogleEmailWithoutProvisioningAnAccount() throws Exception {
        GoogleOAuthLoginService loginService = mock(GoogleOAuthLoginService.class);
        GoogleOAuth2SuccessHandler handler = new GoogleOAuth2SuccessHandler(
                loginService,
                new GoogleOAuthProperties(true, "client-id", "client-secret", null, Duration.ofMinutes(1)),
                mock(ObjectMapper.class)
        );
        MockHttpServletResponse response = new MockHttpServletResponse();

        handler.onAuthenticationSuccess(new MockHttpServletRequest(), response, googleAuthentication(false));

        assertEquals(401, response.getStatus());
        var error = tools.jackson.databind.json.JsonMapper.builder().build()
                .readTree(response.getContentAsString());
        assertEquals("OAUTH_AUTHENTICATION_FAILED", error.path("code").asText());
        assertEquals("OAuth authentication failed.", error.path("message").asText());
        org.junit.jupiter.api.Assertions.assertTrue(error.path("fieldErrors").isObject());
        org.junit.jupiter.api.Assertions.assertTrue(error.has("requestId"));
        verify(loginService, never()).complete(any(), any(), any());
    }

    private static OAuth2AuthenticationToken googleAuthentication(boolean emailVerified) {
        DefaultOAuth2User principal = new DefaultOAuth2User(
                List.of(new SimpleGrantedAuthority("OIDC_USER")),
                Map.of(
                        "sub", "google-subject-123",
                        "email", "candidate@example.test",
                        "email_verified", emailVerified,
                        "name", "Candidate Example"
                ),
                "sub"
        );
        return new OAuth2AuthenticationToken(principal, principal.getAuthorities(), "google");
    }
}
