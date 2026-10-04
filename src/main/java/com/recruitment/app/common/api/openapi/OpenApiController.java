package com.recruitment.app.common.api.openapi;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
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
        Map<String, Object> spec = new LinkedHashMap<>();
        spec.put("openapi", "3.1.0");
        spec.put("info", Map.of(
                "title", "SmartRecruit Platform API",
                "version", "1.0.0",
                "description", "Modular monolith backend API for the SmartRecruit recruitment platform."
        ));
        spec.put("servers", List.of(Map.of("url", "/", "description", "Default server")));
        spec.put("security", List.of(Map.of("bearerAuth", List.of())));

        Map<String, Object> paths = new LinkedHashMap<>();
        paths.putAll(authPaths());
        paths.putAll(accountSecurityPaths());
        spec.put("paths", paths);
        spec.put("components", components());
        return spec;
    }

    private static Map<String, Object> authPaths() {
        return Map.of(
                "/api/v1/auth/register", postEndpoint("Register candidate account", "Auth", false, "RegistrationRequest", "201", "Created"),
                "/api/v1/auth/login", postEndpoint("Log in with email and password", "Auth", false, "PasswordLoginRequest", "200", "Authenticated"),
                "/api/v1/auth/refresh", postEndpoint("Rotate refresh session and issue new access token", "Auth", false, "RefreshTokenRequest", "200", "Tokens refreshed"),
                "/api/v1/auth/logout", postEndpoint("Revoke refresh session", "Auth", false, "RefreshTokenRequest", "204", "Logged out"),
                "/api/v1/auth/me", Map.of(
                        "get", Map.of(
                                "summary", "Retrieve current authenticated account",
                                "tags", List.of("Auth"),
                                "security", List.of(Map.of("bearerAuth", List.of())),
                                "responses", standardResponses("200", "Current user account")
                        )
                ),
                "/api/v1/auth/oauth/exchange", postEndpoint("Exchange single-use PKCE-bound OAuth handoff code", "Auth", false, "OAuthCodeExchangeRequest", "200", "Session issued")
        );
    }

    private static Map<String, Object> accountSecurityPaths() {
        return Map.of(
                "/api/v1/auth/password/change", postEndpoint("Change current account password", "Account Security", true, "ChangePasswordRequest", "204", "Password changed"),
                "/api/v1/auth/password/reset-request", postEndpoint("Request password reset dispatch", "Account Security", false, "PasswordResetRequest", "200", "Reset request accepted"),
                "/api/v1/auth/password/reset-confirm", postEndpoint("Confirm password reset with token", "Account Security", false, "PasswordResetConfirmRequest", "204", "Password reset confirmed"),
                "/api/v1/auth/verify-email", postEndpoint("Verify candidate email address", "Account Security", false, "VerifyEmailRequest", "204", "Email verified")
        );
    }

    private static Map<String, Object> postEndpoint(
            String summary, String tag, boolean authenticated, String requestSchema, String successCode, String successDesc) {
        Map<String, Object> operation = new LinkedHashMap<>();
        operation.put("summary", summary);
        operation.put("tags", List.of(tag));
        if (!authenticated) {
            operation.put("security", List.of());
        }
        if (requestSchema != null) {
            operation.put("requestBody", Map.of("required", true, "content", jsonContent(requestSchema)));
        }
        operation.put("responses", standardResponses(successCode, successDesc));
        return Map.of("post", operation);
    }

    private static Map<String, Object> standardResponses(String successCode, String successDesc) {
        return Map.of(
                successCode, Map.of("description", successDesc),
                "400", Map.of("description", "Bad Request", "content", jsonContent("ApiErrorResponse")),
                "401", Map.of("description", "Unauthorized", "content", jsonContent("ApiErrorResponse")),
                "403", Map.of("description", "Forbidden", "content", jsonContent("ApiErrorResponse"))
        );
    }

    private static Map<String, Object> jsonContent(String schemaRef) {
        return Map.of("application/json", Map.of("schema", Map.of("$ref", "#/components/schemas/" + schemaRef)));
    }

    private static Map<String, Object> components() {
        return Map.of(
                "securitySchemes", Map.of(
                        "bearerAuth", Map.of("type", "http", "scheme", "bearer", "bearerFormat", "JWT")
                ),
                "schemas", requestSchemas()
        );
    }

    private static Map<String, Object> requestSchemas() {
        Map<String, Object> schemas = new LinkedHashMap<>();
        schemas.put("ApiErrorResponse", schema(List.of("code", "message", "fieldErrors", "requestId"),
                Map.of("code", stringProp(), "message", stringProp(), "fieldErrors", objectProp(), "requestId", stringProp())));
        schemas.put("RegistrationRequest", schema(List.of("fullName", "email", "password"),
                Map.of("fullName", stringProp(), "email", stringProp(), "password", stringProp())));
        schemas.put("PasswordLoginRequest", schema(List.of("email", "password"),
                Map.of("email", stringProp(), "password", stringProp())));
        schemas.put("RefreshTokenRequest", schema(List.of("refreshToken"),
                Map.of("refreshToken", stringProp())));
        schemas.put("OAuthCodeExchangeRequest", schema(List.of("code", "codeVerifier", "transactionId"),
                Map.of("code", stringProp(), "codeVerifier", stringProp(), "transactionId", stringProp())));
        schemas.put("ChangePasswordRequest", schema(List.of("currentPassword", "newPassword"),
                Map.of("currentPassword", stringProp(), "newPassword", stringProp())));
        schemas.put("PasswordResetRequest", schema(List.of("email"),
                Map.of("email", stringProp())));
        schemas.put("PasswordResetConfirmRequest", schema(List.of("token", "newPassword"),
                Map.of("token", stringProp(), "newPassword", stringProp())));
        schemas.put("VerifyEmailRequest", schema(List.of("token"),
                Map.of("token", stringProp())));
        return schemas;
    }

    private static Map<String, Object> schema(List<String> required, Map<String, Object> props) {
        return Map.of("type", "object", "required", required, "properties", props);
    }

    private static Map<String, String> stringProp() {
        return Map.of("type", "string");
    }

    private static Map<String, String> objectProp() {
        return Map.of("type", "object");
    }
}
