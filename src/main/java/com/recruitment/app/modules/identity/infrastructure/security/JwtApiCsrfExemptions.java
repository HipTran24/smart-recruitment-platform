package com.recruitment.app.modules.identity.infrastructure.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.security.web.util.matcher.RequestMatcher;
import java.util.Set;

/** No ambient-cookie authentication is accepted by these explicit REST exemptions. */
final class JwtApiCsrfExemptions implements RequestMatcher {
    private static final Set<String> PUBLIC_JSON_AUTH = Set.of(
            "/api/v1/auth/register","/api/v1/auth/login","/api/v1/auth/refresh","/api/v1/auth/logout",
            "/api/v1/auth/oauth/exchange","/api/v1/auth/password/reset-request",
            "/api/v1/auth/password/reset-confirm","/api/v1/auth/verify-email");
    @Override
    public boolean matches(HttpServletRequest request) {
        String path=request.getRequestURI().substring(request.getContextPath().length());
        String authorization=request.getHeader("Authorization");
        if (path.startsWith("/api/") && authorization!=null &&
                authorization.regionMatches(true,0,"Bearer ",0,7) && !authorization.substring(7).isBlank()) return true;
        if (!"POST".equals(request.getMethod()) || !PUBLIC_JSON_AUTH.contains(path)) return false;
        try { return MediaType.APPLICATION_JSON.isCompatibleWith(MediaType.parseMediaType(request.getContentType())); }
        catch (IllegalArgumentException ex) { return false; }
    }
}
