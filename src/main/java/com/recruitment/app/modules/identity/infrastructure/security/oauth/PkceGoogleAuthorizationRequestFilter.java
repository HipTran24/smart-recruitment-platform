package com.recruitment.app.modules.identity.infrastructure.security.oauth;

import com.recruitment.app.common.api.error.ApiErrorWriter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Requires a frontend-generated S256 PKCE challenge before a Google OAuth
 * request is redirected. The matching verifier is required to redeem the
 * application's own one-time handoff code after callback.
 */
public final class PkceGoogleAuthorizationRequestFilter extends OncePerRequestFilter {

    static final String TRANSACTION_ID_PARAMETER = "transaction_id";
    static final String TRANSACTION_ID_REQUEST_ATTRIBUTE = PkceGoogleAuthorizationRequestFilter.class.getName()
            + ".TRANSACTION_ID";

    private static final String AUTHORIZATION_PATH = "/oauth2/authorization/google";
    private static final String PENDING_TRANSACTIONS_SESSION_ATTRIBUTE = PkceGoogleAuthorizationRequestFilter.class.getName()
            + ".PENDING_TRANSACTIONS";
    private static final int MAX_PENDING_TRANSACTIONS = 16;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        return !"GET".equalsIgnoreCase(request.getMethod()) || !AUTHORIZATION_PATH.equals(path);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws IOException, ServletException {
        String codeChallenge = singleParameter(request, "code_challenge");
        String codeChallengeMethod = singleParameter(request, "code_challenge_method");
        String transactionId = singleParameter(request, TRANSACTION_ID_PARAMETER);
        if (codeChallenge == null || !codeChallenge.matches("[A-Za-z0-9_-]{43}")
                || !"S256".equals(codeChallengeMethod)
                || !isValidTransactionId(transactionId)
                || !registerPendingTransaction(request, transactionId, codeChallenge)) {
            writeInvalidRequest(response);
            return;
        }

        request.setAttribute(TRANSACTION_ID_REQUEST_ATTRIBUTE, transactionId);
        filterChain.doFilter(request, response);
    }

    /**
     * Registers a frontend-created transaction identifier and its PKCE challenge
     * in the browser session. The identifier must be generated from at least 32
     * random bytes by the frontend and is used only for request correlation; the
     * verifier itself is never stored here.
     */
    static boolean registerPendingTransaction(
            HttpServletRequest request,
            String transactionId,
            String codeChallenge
    ) {
        if (!isValidTransactionId(transactionId) || codeChallenge == null || !codeChallenge.matches("[A-Za-z0-9_-]{43}")) {
            return false;
        }

        HttpSession session = request.getSession(true);
        synchronized (session) {
            Map<String, String> transactions = pendingTransactions(session);
            if (transactions.containsKey(transactionId) || transactions.size() >= MAX_PENDING_TRANSACTIONS) {
                return false;
            }
            transactions.put(transactionId, codeChallenge);
            request.setAttribute(TRANSACTION_ID_REQUEST_ATTRIBUTE, transactionId);
            return true;
        }
    }

    static String transactionIdFromRequest(HttpServletRequest request) {
        Object transactionId = request.getAttribute(TRANSACTION_ID_REQUEST_ATTRIBUTE);
        return transactionId instanceof String value && isValidTransactionId(value) ? value : null;
    }

    static String consumeCodeChallenge(HttpServletRequest request, String transactionId) {
        if (!isValidTransactionId(transactionId)) {
            return null;
        }
        HttpSession session = request.getSession(false);
        if (session == null) {
            return null;
        }
        synchronized (session) {
            Map<String, String> transactions = pendingTransactions(session);
            String challenge = transactions.remove(transactionId);
            removeWhenEmpty(session, transactions);
            return challenge != null && challenge.matches("[A-Za-z0-9_-]{43}") ? challenge : null;
        }
    }

    static void discardCodeChallenge(HttpServletRequest request) {
        String transactionId = transactionIdFromRequest(request);
        if (transactionId != null) {
            consumeCodeChallenge(request, transactionId);
        }
    }

    static boolean hasPendingTransaction(HttpSession session, String transactionId) {
        if (!isValidTransactionId(transactionId)) {
            return false;
        }
        synchronized (session) {
            return pendingTransactions(session).containsKey(transactionId);
        }
    }

    static boolean isValidTransactionId(String value) {
        return value != null && value.matches("[A-Za-z0-9_-]{43}");
    }

    private static String singleParameter(HttpServletRequest request, String name) {
        String[] values = request.getParameterValues(name);
        if (values == null || values.length != 1 || values[0] == null || values[0].isBlank()) {
            return null;
        }
        return values[0];
    }

    @SuppressWarnings("unchecked")
    private static Map<String, String> pendingTransactions(HttpSession session) {
        Object existing = session.getAttribute(PENDING_TRANSACTIONS_SESSION_ATTRIBUTE);
        if (existing instanceof Map<?, ?> transactions) {
            return (Map<String, String>) transactions;
        }
        Map<String, String> transactions = new LinkedHashMap<>();
        session.setAttribute(PENDING_TRANSACTIONS_SESSION_ATTRIBUTE, transactions);
        return transactions;
    }

    private static void removeWhenEmpty(HttpSession session, Map<String, String> transactions) {
        if (transactions.isEmpty()) {
            session.removeAttribute(PENDING_TRANSACTIONS_SESSION_ATTRIBUTE);
        }
    }

    private static void writeInvalidRequest(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader("Cache-Control", "no-store, max-age=0");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Referrer-Policy", "no-referrer");
        ApiErrorWriter.write(response, response.getStatus(),
                "INVALID_OAUTH_REQUEST", "A valid PKCE challenge is required.");
    }
}
