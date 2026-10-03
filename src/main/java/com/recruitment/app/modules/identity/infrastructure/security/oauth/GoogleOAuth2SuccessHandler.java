package com.recruitment.app.modules.identity.infrastructure.security.oauth;

import com.recruitment.app.common.api.error.ApiErrorWriter;
import com.recruitment.app.modules.identity.application.GoogleOAuthLoginService;
import com.recruitment.app.modules.identity.application.OAuthAuthorizationCodeService;
import com.recruitment.app.modules.identity.application.command.GoogleIdentityProfile;
import com.recruitment.app.modules.identity.application.exception.IdentityAuthenticationException;
import com.recruitment.app.modules.identity.application.exception.OAuthIdentityException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Map;

import tools.jackson.databind.ObjectMapper;

/**
 * Converts a verified Google OIDC callback into a short-lived, one-time code.
 * Access and refresh tokens are never appended to a browser redirect URL.
 */
@Component
@ConditionalOnProperty(prefix = "app.security.oauth2.google", name = "enabled", havingValue = "true")
public class GoogleOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final GoogleOAuthLoginService googleOAuthLogin;
    private final GoogleOAuthProperties properties;
    private final ObjectMapper objectMapper;

    public GoogleOAuth2SuccessHandler(
            GoogleOAuthLoginService googleOAuthLogin,
            GoogleOAuthProperties properties,
            ObjectMapper objectMapper
    ) {
        this.googleOAuthLogin = googleOAuthLogin;
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {
        try {
            GoogleIdentityProfile profile = profileFrom(authentication);
            String transactionId = TransactionBoundOAuth2AuthorizationRequestRepository.transactionIdFromCallback(request);
            String codeChallenge = PkceGoogleAuthorizationRequestFilter.consumeCodeChallenge(request, transactionId);
            if (transactionId == null || codeChallenge == null) {
                throw new OAuthIdentityException("OAuth session did not contain a PKCE transaction");
            }
            OAuthAuthorizationCodeService.IssuedAuthorizationCode code = googleOAuthLogin.complete(
                    profile,
                    codeChallenge,
                    transactionId
            );
            clearOAuthSecurityContext();
            applySensitiveResponseHeaders(response);

            if (properties.parsedSuccessRedirectUri().isPresent()) {
                response.sendRedirect(withAuthorizationCode(
                        properties.parsedSuccessRedirectUri().orElseThrow(),
                        code.rawCode(),
                        code.transactionId()
                ));
                return;
            }

            response.setStatus(HttpServletResponse.SC_OK);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(objectMapper.writeValueAsString(Map.of(
                    "code", code.rawCode(),
                    "transactionId", code.transactionId(),
                    "expiresAt", code.expiresAt().toString()
            )));
        }
        catch (IdentityAuthenticationException | OAuthIdentityException | DataIntegrityViolationException exception) {
            PkceGoogleAuthorizationRequestFilter.discardCodeChallenge(request);
            clearOAuthSecurityContext();
            writeFailure(response);
        }
    }

    private static GoogleIdentityProfile profileFrom(Authentication authentication) {
        if (!(authentication instanceof OAuth2AuthenticationToken oauth)
                || !"google".equals(oauth.getAuthorizedClientRegistrationId())) {
            throw new OAuthIdentityException("Unexpected OAuth registration");
        }

        Map<String, Object> attributes = oauth.getPrincipal().getAttributes();
        return new GoogleIdentityProfile(
                requiredClaim(attributes, "sub"),
                requiredClaim(attributes, "email"),
                verifiedEmail(attributes.get("email_verified")),
                optionalClaim(attributes, "name")
        );
    }

    private static String requiredClaim(Map<String, Object> attributes, String name) {
        String value = optionalClaim(attributes, name);
        if (value == null) {
            throw new OAuthIdentityException("Google response omitted " + name);
        }
        return value;
    }

    private static String optionalClaim(Map<String, Object> attributes, String name) {
        Object value = attributes.get(name);
        if (!(value instanceof String text) || text.isBlank()) {
            return null;
        }
        return text.strip();
    }

    private static boolean verifiedEmail(Object value) {
        if (value instanceof Boolean verified) {
            return verified;
        }
        if (value instanceof String text) {
            return "true".equals(text.strip().toLowerCase(Locale.ROOT));
        }
        return false;
    }

    private static String withAuthorizationCode(URI redirectUri, String rawCode, String transactionId) {
        return UriComponentsBuilder.fromUri(redirectUri)
                .queryParam("code", rawCode)
                .queryParam(PkceGoogleAuthorizationRequestFilter.TRANSACTION_ID_PARAMETER, transactionId)
                .build()
                .encode(StandardCharsets.UTF_8)
                .toUriString();
    }

    private static void clearOAuthSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    static void applySensitiveResponseHeaders(HttpServletResponse response) {
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store, max-age=0");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Referrer-Policy", "no-referrer");
    }

    static void writeFailure(HttpServletResponse response) throws IOException {
        if (response.isCommitted()) {
            return;
        }
        applySensitiveResponseHeaders(response);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ApiErrorWriter.write(response, response.getStatus(),
                "OAUTH_AUTHENTICATION_FAILED", "OAuth authentication failed.");
    }
}
