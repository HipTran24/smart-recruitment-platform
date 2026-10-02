package com.recruitment.app.modules.identity.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;

/**
 * Servlet boundary for application JWT bearer authentication. It accepts only
 * a single RFC 6750-style Bearer header and never logs or returns token data.
 */
public final class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final String INVALID_TOKEN_BODY = """
            {"code":"INVALID_ACCESS_TOKEN","message":"Access token is invalid or expired."}
            """.strip();

    private final JwtAccessTokenService jwtAccessTokenService;

    JwtAuthenticationFilter(JwtAccessTokenService jwtAccessTokenService) {
        this.jwtAccessTokenService = jwtAccessTokenService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        BearerTokenResolution resolution = resolveBearerToken(request);
        if (resolution.malformed()) {
            writeInvalidToken(response);
            return;
        }
        if (resolution.token() == null || hasNonAnonymousAuthentication()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            JwtPrincipal principal = jwtAccessTokenService.authenticate(resolution.token());
            Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
                    principal,
                    null,
                    principal.authorities()
            );
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            filterChain.doFilter(request, response);
        } catch (InvalidAccessTokenException exception) {
            SecurityContextHolder.clearContext();
            writeInvalidToken(response);
        }
    }

    private static boolean hasNonAnonymousAuthentication() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken);
    }

    private static BearerTokenResolution resolveBearerToken(HttpServletRequest request) {
        Enumeration<String> values = request.getHeaders(HttpHeaders.AUTHORIZATION);
        List<String> headers = values == null ? List.of() : Collections.list(values);
        if (headers.isEmpty()) {
            return BearerTokenResolution.absent();
        }

        String bearerToken = null;
        for (String header : headers) {
            if (header == null) {
                continue;
            }
            if (header.regionMatches(true, 0, "Bearer", 0, "Bearer".length())) {
                if (!header.regionMatches(true, 0, BEARER_PREFIX, 0, BEARER_PREFIX.length())) {
                    return BearerTokenResolution.invalid();
                }
                String candidate = header.substring(BEARER_PREFIX.length()).strip();
                if (candidate.isEmpty() || containsWhitespace(candidate) || bearerToken != null) {
                    return BearerTokenResolution.invalid();
                }
                bearerToken = candidate;
            }
        }
        return bearerToken == null ? BearerTokenResolution.absent() : BearerTokenResolution.present(bearerToken);
    }

    private static boolean containsWhitespace(String value) {
        return value.chars().anyMatch(Character::isWhitespace);
    }

    private static void writeInvalidToken(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setHeader(HttpHeaders.WWW_AUTHENTICATE, "Bearer error=\"invalid_token\"");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(INVALID_TOKEN_BODY);
    }

    private record BearerTokenResolution(String token, boolean malformed) {

        static BearerTokenResolution absent() {
            return new BearerTokenResolution(null, false);
        }

        static BearerTokenResolution present(String token) {
            return new BearerTokenResolution(token, false);
        }

        static BearerTokenResolution invalid() {
            return new BearerTokenResolution(null, true);
        }
    }
}
