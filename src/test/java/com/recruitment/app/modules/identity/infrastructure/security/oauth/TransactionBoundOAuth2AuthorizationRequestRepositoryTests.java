package com.recruitment.app.modules.identity.infrastructure.security.oauth;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TransactionBoundOAuth2AuthorizationRequestRepositoryTests {

    @Test
    void keepsConcurrentAuthorizationRequestsBoundToTheirOwnPkceTransaction() {
        TransactionBoundOAuth2AuthorizationRequestRepository repository =
                new TransactionBoundOAuth2AuthorizationRequestRepository();
        MockHttpSession session = new MockHttpSession();
        String firstTransaction = "a".repeat(43);
        String secondTransaction = "b".repeat(43);

        OAuth2AuthorizationRequest firstRequest = authorizationRequest("spring-state-one");
        OAuth2AuthorizationRequest secondRequest = authorizationRequest("spring-state-two");
        repository.saveAuthorizationRequest(
                firstRequest,
                startRequest(session, firstTransaction, "c".repeat(43)),
                new MockHttpServletResponse()
        );
        repository.saveAuthorizationRequest(
                secondRequest,
                startRequest(session, secondTransaction, "d".repeat(43)),
                new MockHttpServletResponse()
        );

        MockHttpServletRequest secondCallback = callbackRequest(session, "spring-state-two");
        assertEquals(secondRequest, repository.removeAuthorizationRequest(secondCallback, new MockHttpServletResponse()));
        assertEquals(secondTransaction,
                TransactionBoundOAuth2AuthorizationRequestRepository.transactionIdFromCallback(secondCallback));
        assertEquals("d".repeat(43), PkceGoogleAuthorizationRequestFilter.consumeCodeChallenge(
                secondCallback,
                secondTransaction
        ));

        MockHttpServletRequest firstCallback = callbackRequest(session, "spring-state-one");
        assertEquals(firstRequest, repository.removeAuthorizationRequest(firstCallback, new MockHttpServletResponse()));
        assertEquals(firstTransaction,
                TransactionBoundOAuth2AuthorizationRequestRepository.transactionIdFromCallback(firstCallback));
        assertEquals("c".repeat(43), PkceGoogleAuthorizationRequestFilter.consumeCodeChallenge(
                firstCallback,
                firstTransaction
        ));
    }

    @Test
    void rejectsAProviderCallbackThatSuppliesTransactionParameters() {
        TransactionBoundOAuth2AuthorizationRequestRepository repository =
                new TransactionBoundOAuth2AuthorizationRequestRepository();
        MockHttpSession session = new MockHttpSession();
        String transactionId = "a".repeat(43);
        repository.saveAuthorizationRequest(
                authorizationRequest("spring-state"),
                startRequest(session, transactionId, "b".repeat(43)),
                new MockHttpServletResponse()
        );

        MockHttpServletRequest callback = callbackRequest(session, "spring-state");
        callback.addParameter(PkceGoogleAuthorizationRequestFilter.TRANSACTION_ID_PARAMETER, transactionId);

        assertNull(repository.removeAuthorizationRequest(callback, new MockHttpServletResponse()));
        assertTrue(PkceGoogleAuthorizationRequestFilter.hasPendingTransaction(session, transactionId));
    }

    private static MockHttpServletRequest startRequest(
            MockHttpSession session,
            String transactionId,
            String codeChallenge
    ) {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/oauth2/authorization/google");
        request.setSession(session);
        assertTrue(PkceGoogleAuthorizationRequestFilter.registerPendingTransaction(request, transactionId, codeChallenge));
        return request;
    }

    private static MockHttpServletRequest callbackRequest(MockHttpSession session, String state) {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/login/oauth2/code/google");
        request.setSession(session);
        request.addParameter("state", state);
        return request;
    }

    private static OAuth2AuthorizationRequest authorizationRequest(String state) {
        return OAuth2AuthorizationRequest.authorizationCode()
                .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
                .clientId("client-id")
                .redirectUri("https://api.example.test/login/oauth2/code/google")
                .state(state)
                .build();
    }
}
