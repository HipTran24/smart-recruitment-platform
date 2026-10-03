package com.recruitment.app.common.api.openapi;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Serves canonical OpenAPI 3.1 API contract specification.
 */
@RestController
public class OpenApiController {

    private static final Map<String, Object> SPEC = createSpecification();

    @GetMapping(value = {"/v3/api-docs", "/v3/api-docs/openapi.json"}, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getOpenApiSpec() {
        return ResponseEntity.ok(SPEC);
    }

    private static Map<String, Object> createSpecification() {
        return Map.of(
                "openapi", "3.1.0",
                "info", Map.of(
                        "title", "SmartRecruit Platform API",
                        "version", "1.0.0",
                        "description", "Modular monolith backend API for the SmartRecruit recruitment platform."
                ),
                "servers", List.of(Map.of("url", "/", "description", "Default server")),
                "paths", Map.of(
                        "/api/v1/auth/register", Map.of(
                                "post", Map.of(
                                        "summary", "Register candidate account",
                                        "tags", List.of("Auth"),
                                        "responses", Map.of("201", Map.of("description", "Created"))
                                )
                        ),
                        "/api/v1/auth/login", Map.of(
                                "post", Map.of(
                                        "summary", "Log in with email and password",
                                        "tags", List.of("Auth"),
                                        "responses", Map.of("200", Map.of("description", "Authenticated"))
                                )
                        ),
                        "/api/v1/auth/refresh", Map.of(
                                "post", Map.of(
                                        "summary", "Rotate refresh session and issue new access token",
                                        "tags", List.of("Auth"),
                                        "responses", Map.of("200", Map.of("description", "Tokens refreshed"))
                                )
                        ),
                        "/api/v1/auth/logout", Map.of(
                                "post", Map.of(
                                        "summary", "Revoke refresh session",
                                        "tags", List.of("Auth"),
                                        "responses", Map.of("204", Map.of("description", "Logged out"))
                                )
                        ),
                        "/api/v1/auth/me", Map.of(
                                "get", Map.of(
                                        "summary", "Retrieve current authenticated account",
                                        "tags", List.of("Auth"),
                                        "security", List.of(Map.of("bearerAuth", List.of())),
                                        "responses", Map.of("200", Map.of("description", "Current user account"))
                                )
                        ),
                        "/api/v1/auth/oauth/exchange", Map.of(
                                "post", Map.of(
                                        "summary", "Exchange single-use PKCE-bound OAuth handoff code",
                                        "tags", List.of("Auth"),
                                        "responses", Map.of("200", Map.of("description", "Session issued"))
                                )
                        )
                ),
                "components", Map.of(
                        "securitySchemes", Map.of(
                                "bearerAuth", Map.of(
                                        "type", "http",
                                        "scheme", "bearer",
                                        "bearerFormat", "JWT"
                                )
                        )
                )
        );
    }
}
