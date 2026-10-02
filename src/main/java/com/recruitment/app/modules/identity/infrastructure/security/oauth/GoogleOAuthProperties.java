package com.recruitment.app.modules.identity.infrastructure.security.oauth;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.net.URI;
import java.net.URLDecoder;
import java.time.Duration;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

/**
 * Google OpenID Connect client settings. Secrets are supplied exclusively by
 * the runtime environment or a secret manager, never by source control.
 */
@ConfigurationProperties("app.security.oauth2.google")
public record GoogleOAuthProperties(
        boolean enabled,
        String clientId,
        String clientSecret,
        String successRedirectUri,
        Duration authorizationCodeTtl
) {

    private static final Duration DEFAULT_AUTHORIZATION_CODE_TTL = Duration.ofMinutes(1);

    public GoogleOAuthProperties {
        authorizationCodeTtl = authorizationCodeTtl == null
                ? DEFAULT_AUTHORIZATION_CODE_TTL
                : authorizationCodeTtl;
    }

    public void validateEnabledConfiguration() {
        if (!enabled) {
            return;
        }
        if (!hasText(clientId) || !hasText(clientSecret)) {
            throw new IllegalStateException(
                    "GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET are required when Google OAuth is enabled"
            );
        }
        if (authorizationCodeTtl.isNegative() || authorizationCodeTtl.isZero()
                || authorizationCodeTtl.compareTo(Duration.ofMinutes(5)) > 0) {
            throw new IllegalStateException("Google OAuth authorization code TTL must be between 1 second and 5 minutes");
        }
        parsedSuccessRedirectUri().ifPresent(uri -> {
            String scheme = uri.getScheme();
            boolean localHttp = "http".equalsIgnoreCase(scheme)
                    && ("localhost".equalsIgnoreCase(uri.getHost()) || "127.0.0.1".equals(uri.getHost()));
            if (!("https".equalsIgnoreCase(scheme) || localHttp)
                    || uri.getHost() == null
                    || uri.getUserInfo() != null
                    || uri.getFragment() != null) {
                throw new IllegalStateException(
                        "Google OAuth success redirect URI must use HTTPS (or localhost HTTP) and must not contain a fragment"
                );
            }
            rejectReservedHandoffParameters(uri);
        });
    }

    public Optional<URI> parsedSuccessRedirectUri() {
        if (!hasText(successRedirectUri)) {
            return Optional.empty();
        }
        try {
            return Optional.of(URI.create(successRedirectUri.strip()));
        }
        catch (IllegalArgumentException exception) {
            throw new IllegalStateException("Google OAuth success redirect URI is invalid", exception);
        }
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private static void rejectReservedHandoffParameters(URI uri) {
        String rawQuery = uri.getRawQuery();
        if (rawQuery == null || rawQuery.isBlank()) {
            return;
        }
        for (String parameter : rawQuery.split("[&;]", -1)) {
            String rawName = parameter.substring(0, parameter.indexOf('=') >= 0 ? parameter.indexOf('=') : parameter.length());
            String name;
            try {
                name = URLDecoder.decode(rawName, StandardCharsets.UTF_8);
            }
            catch (IllegalArgumentException exception) {
                throw new IllegalStateException("Google OAuth success redirect URI has an invalid query parameter", exception);
            }
            if ("code".equalsIgnoreCase(name)
                    || "transaction_id".equalsIgnoreCase(name)
                    || "transactionid".equalsIgnoreCase(name)) {
                throw new IllegalStateException(
                        "Google OAuth success redirect URI must not pre-supply code or transaction_id"
                );
            }
        }
    }
}
