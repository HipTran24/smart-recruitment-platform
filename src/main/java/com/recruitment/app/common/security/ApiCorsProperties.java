package com.recruitment.app.common.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.net.URI;
import java.util.List;

/**
 * Exact browser origins allowed to call the bearer-token API. An empty list
 * denies cross-origin browser access by default.
 */
@ConfigurationProperties("app.web.cors")
public class ApiCorsProperties {

    private String allowedOrigins;

    public List<String> getAllowedOrigins() {
        if (allowedOrigins == null || allowedOrigins.isBlank()) {
            return List.of();
        }
        return List.of(allowedOrigins.split(",")).stream()
                .map(String::strip)
                .toList();
    }

    public void setAllowedOrigins(String allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }

    public void validate() {
        for (String value : getAllowedOrigins()) {
            if (value == null || value.isBlank() || "*".equals(value.trim())) {
                throw new IllegalStateException("CORS origins must be explicit; wildcard origins are not allowed");
            }
            URI origin;
            try {
                origin = URI.create(value.strip());
            }
            catch (IllegalArgumentException exception) {
                throw new IllegalStateException("Configured CORS origin is invalid", exception);
            }
            boolean localHttp = "http".equalsIgnoreCase(origin.getScheme())
                    && ("localhost".equalsIgnoreCase(origin.getHost()) || "127.0.0.1".equals(origin.getHost()));
            if (!("https".equalsIgnoreCase(origin.getScheme()) || localHttp)
                    || origin.getHost() == null
                    || origin.getPath() != null && !origin.getPath().isEmpty()
                    || origin.getQuery() != null
                    || origin.getFragment() != null
                    || origin.getUserInfo() != null) {
                throw new IllegalStateException("CORS origins must be HTTPS origins (or localhost HTTP) without a path");
            }
        }
    }
}
