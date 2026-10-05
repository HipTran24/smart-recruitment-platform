package com.recruitment.app.modules.identity.infrastructure.security;

import com.recruitment.app.common.api.error.ApiErrorWriter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.recruitment.app.modules.identity.application.JwtPrincipal;
import org.springframework.security.web.util.matcher.RequestMatcher;

import java.io.IOException;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;

/**
 * Servlet boundary for application JWT bearer authentication. It accepts only
 * a single RFC 6750-style Bearer header and never logs or returns token data.
 */
public final class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtAccessTokenService jwtAccessTokenService;
    private final LiveAccountValidator liveAccountValidator;
    private final RequestMatcher publicEndpointsMatcher;

    public JwtAuthenticationFilter(JwtAccessTokenService jwtAccessTokenService) {
        this(jwtAccessTokenService, null, null);
    }

    public JwtAuthenticationFilter(JwtAccessTokenService jwtAccessTokenService, LiveAccountValidator liveAccountValidator) {
        this(jwtAccessTokenService, liveAccountValidator, null);
    }

    public JwtAuthenticationFilter(
            JwtAccessTokenService jwtAccessTokenService,
            LiveAccountValidator liveAccountValidator,
            RequestMatcher publicEndpointsMatcher
    ) {
        this.jwtAccessTokenService = jwtAccessTokenService;
        this.liveAccountValidator = liveAccountValidator;
        this.publicEndpointsMatcher = publicEndpointsMatcher;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        if (publicEndpointsMatcher != null && publicEndpointsMatcher.matches(request)) {
            filterChain.doFilter(request, response);
            return;
        }

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
            if (liveAccountValidator != null && !liveAccountValidator.isAccountLive(principal.userId(), principal.credentialVersion())) {
                SecurityContextHolder.clearContext();
                writeInvalidToken(response);
                return;
            }
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
        response.setHeader(HttpHeaders.WWW_AUTHENTICATE, "Bearer error=\"invalid_token\"");
        ApiErrorWriter.write(response,
                HttpServletResponse.SC_UNAUTHORIZED, "INVALID_ACCESS_TOKEN",
                "Access token is invalid or expired.");
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
