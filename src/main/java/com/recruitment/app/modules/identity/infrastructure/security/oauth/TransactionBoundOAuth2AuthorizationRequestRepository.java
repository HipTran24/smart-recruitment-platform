package com.recruitment.app.modules.identity.infrastructure.security.oauth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.oauth2.client.web.AuthorizationRequestRepository;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import java.io.Serializable;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Stores multiple outstanding Spring OAuth authorization requests in one
 * browser session and binds each Spring-generated state value to the frontend
 * PKCE transaction identifier that started it. Spring's default HTTP-session
 * repository stores only one outstanding request, which makes concurrent tabs
 * overwrite each other's state.
 */
public final class TransactionBoundOAuth2AuthorizationRequestRepository
        implements AuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    static final String CALLBACK_TRANSACTION_ID_ATTRIBUTE = TransactionBoundOAuth2AuthorizationRequestRepository.class.getName()
            + ".CALLBACK_TRANSACTION_ID";

    private static final String AUTHORIZATION_REQUESTS_SESSION_ATTRIBUTE = TransactionBoundOAuth2AuthorizationRequestRepository.class.getName()
            + ".AUTHORIZATION_REQUESTS";

    @Override
    public OAuth2AuthorizationRequest loadAuthorizationRequest(HttpServletRequest request) {
        String state = singleCallbackState(request);
        if (state == null) {
            return null;
        }

        HttpSession session = request.getSession(false);
        if (session == null) {
            return null;
        }
        synchronized (session) {
            PendingAuthorizationRequest pending = authorizationRequests(session).get(state);
            return pending == null ? null : pending.authorizationRequest();
        }
    }

    @Override
    public void saveAuthorizationRequest(
            OAuth2AuthorizationRequest authorizationRequest,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        if (authorizationRequest == null) {
            return;
        }

        String transactionId = PkceGoogleAuthorizationRequestFilter.transactionIdFromRequest(request);
        String state = authorizationRequest.getState();
        if (transactionId == null || state == null || state.isBlank()) {
            throw new IllegalStateException("OAuth authorization request is missing its PKCE transaction binding");
        }

        HttpSession session = request.getSession(true);
        synchronized (session) {
            Map<String, PendingAuthorizationRequest> requests = authorizationRequests(session);
            requests.entrySet().removeIf(entry -> !PkceGoogleAuthorizationRequestFilter.hasPendingTransaction(
                    session,
                    entry.getValue().transactionId()
            ));
            if (!PkceGoogleAuthorizationRequestFilter.hasPendingTransaction(session, transactionId)
                    || requests.containsKey(state)) {
                throw new IllegalStateException("OAuth authorization request could not be bound to its PKCE transaction");
            }
            requests.put(state, new PendingAuthorizationRequest(authorizationRequest, transactionId));
        }
    }

    @Override
    public OAuth2AuthorizationRequest removeAuthorizationRequest(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        String state = singleCallbackState(request);
        if (state == null) {
            return null;
        }

        HttpSession session = request.getSession(false);
        if (session == null) {
            return null;
        }
        synchronized (session) {
            PendingAuthorizationRequest pending = authorizationRequests(session).remove(state);
            removeWhenEmpty(session);
            if (pending == null || !PkceGoogleAuthorizationRequestFilter.hasPendingTransaction(
                    session,
                    pending.transactionId()
            )) {
                return null;
            }
            request.setAttribute(CALLBACK_TRANSACTION_ID_ATTRIBUTE, pending.transactionId());
            return pending.authorizationRequest();
        }
    }

    static String transactionIdFromCallback(HttpServletRequest request) {
        Object transactionId = request.getAttribute(CALLBACK_TRANSACTION_ID_ATTRIBUTE);
        return transactionId instanceof String value && PkceGoogleAuthorizationRequestFilter.isValidTransactionId(value)
                ? value
                : null;
    }

    private static String singleCallbackState(HttpServletRequest request) {
        // The transaction identifier is an application-only value. Google never
        // needs it, so a provider callback containing it is rejected rather than
        // letting an attacker create ambiguity with the server-side binding.
        if (request.getParameterValues(PkceGoogleAuthorizationRequestFilter.TRANSACTION_ID_PARAMETER) != null) {
            return null;
        }
        String[] values = request.getParameterValues("state");
        if (values == null || values.length != 1 || values[0] == null || values[0].isBlank()) {
            return null;
        }
        return values[0];
    }

    @SuppressWarnings("unchecked")
    private static Map<String, PendingAuthorizationRequest> authorizationRequests(HttpSession session) {
        Object existing = session.getAttribute(AUTHORIZATION_REQUESTS_SESSION_ATTRIBUTE);
        if (existing instanceof Map<?, ?> requests) {
            return (Map<String, PendingAuthorizationRequest>) requests;
        }
        Map<String, PendingAuthorizationRequest> requests = new LinkedHashMap<>();
        session.setAttribute(AUTHORIZATION_REQUESTS_SESSION_ATTRIBUTE, requests);
        return requests;
    }

    private static void removeWhenEmpty(HttpSession session) {
        if (authorizationRequests(session).isEmpty()) {
            session.removeAttribute(AUTHORIZATION_REQUESTS_SESSION_ATTRIBUTE);
        }
    }

    private record PendingAuthorizationRequest(
            OAuth2AuthorizationRequest authorizationRequest,
            String transactionId
    ) implements Serializable {
    }
}
