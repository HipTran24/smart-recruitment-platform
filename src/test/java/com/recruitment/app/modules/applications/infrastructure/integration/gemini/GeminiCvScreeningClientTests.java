package com.recruitment.app.modules.applications.infrastructure.integration.gemini;

import com.recruitment.app.modules.applications.application.screening.CvScreeningException;
import com.recruitment.app.modules.applications.application.screening.CvScreeningRequest;
import com.recruitment.app.modules.applications.application.screening.CvScreeningResult;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GeminiCvScreeningClientTests {

    private final JsonMapper objectMapper = new JsonMapper();
    private HttpServer server;
    private AtomicReference<String> requestBody;
    private AtomicReference<String> apiKey;
    private volatile String responseBody;
    private volatile int responseStatus;

    @BeforeEach
    void startServer() throws IOException {
        requestBody = new AtomicReference<>();
        apiKey = new AtomicReference<>();
        responseBody = geminiResponse("""
                {"score":82,"recommendation":"RECOMMENDED","summary":"Relevant Java and Spring experience.",
                "matchedCriteria":["Java","Spring Boot"],"missingCriteria":["Kubernetes"],
                "limitations":["Employment duration was not stated."]}
                """);
        responseStatus = 200;

        server = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
        server.createContext("/v1beta/models/gemini-2.5-flash:generateContent", this::handleRequest);
        server.start();
    }

    @AfterEach
    void stopServer() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    void sendsConstrainedPromptWithDirectIdentifiersRedactedAndParsesStructuredResult() throws Exception {
        GeminiCvScreeningClient client = client();

        CvScreeningResult result = client.screen(new CvScreeningRequest(
                "Backend Engineer",
                "Build and operate Java services.",
                List.of("Java", "Spring Boot", "Kubernetes"),
                "Name: Jane Doe\nAddress: 1 Example Street\nDOB: 1990-01-01\n"
                        + "jane.doe@example.com\n+84 912 345 678\nhttps://linkedin.example/jane\n"
                        + "Experience: Senior Dev (03/2019 - 07/2023)\nEducation: BSc CS (2013 - 2017)\n"
                        + "Five years building Java services."
        ));

        assertEquals(82, result.score());
        assertEquals(CvScreeningResult.Recommendation.RECOMMENDED, result.recommendation());
        assertEquals(List.of("Java", "Spring Boot"), result.matchedCriteria());
        assertEquals("gemini", result.provider());
        assertEquals("gemini-2.5-flash", result.model());
        assertEquals("test-api-key", apiKey.get());

        JsonNode payload = objectMapper.readTree(requestBody.get());
        String prompt = payload.path("contents").get(0).path("parts").get(0).path("text").asText();
        assertTrue(prompt.contains("[redacted-email]"));
        assertTrue(prompt.contains("[redacted-phone]"));
        assertTrue(prompt.contains("[redacted-sensitive-line]"));
        assertTrue(prompt.contains("[redacted-url]"));
        assertTrue(prompt.contains("(03/2019 - 07/2023)"));
        assertTrue(prompt.contains("(2013 - 2017)"));
        assertFalse(prompt.contains("Jane Doe"));
        assertFalse(prompt.contains("1 Example Street"));
        assertFalse(prompt.contains("1990-01-01"));
        assertFalse(prompt.contains("jane.doe@example.com"));
        assertFalse(prompt.contains("+84 912 345 678"));
        assertEquals(
                "application/json",
                payload.path("generationConfig").path("responseMimeType").asText()
        );
        assertTrue(
                payload.path("generationConfig").path("responseSchema").path("required").isArray()
        );
    }

    @Test
    void rejectsProviderResultOutsideTheSupportedScoreRange() {
        responseBody = geminiResponse("""
                {"score":101,"recommendation":"RECOMMENDED","summary":"Unexpected score.",
                "matchedCriteria":[],"missingCriteria":[],"limitations":[]}
                """);

        CvScreeningException exception = assertThrows(
                CvScreeningException.class,
                () -> client().screen(validRequest())
        );

        assertEquals(CvScreeningException.Reason.INVALID_PROVIDER_RESPONSE, exception.getReason());
        assertFalse(exception.isRetryable());
    }

    @Test
    void refusesInsecureEndpointUnlessExplicitlyAllowedForLocalTesting() {
        GeminiCvScreeningProperties properties = configuredProperties();
        properties.setAllowInsecureEndpoint(false);

        CvScreeningException exception = assertThrows(CvScreeningException.class, properties::validateOperationalConfiguration);

        assertEquals(CvScreeningException.Reason.NOT_CONFIGURED, exception.getReason());
    }

    @Test
    void marksRateLimitsAsRetryableWithoutExposingTheProviderResponse() {
        responseStatus = 429;
        responseBody = "{\"error\":{\"message\":\"do not expose this provider detail\"}}";

        CvScreeningException exception = assertThrows(
                CvScreeningException.class,
                () -> client().screen(validRequest())
        );

        assertEquals(CvScreeningException.Reason.PROVIDER_UNAVAILABLE, exception.getReason());
        assertTrue(exception.isRetryable());
        assertFalse(exception.getMessage().contains("do not expose this provider detail"));
    }

    @Test
    void redactsDirectIdentifiersBeforePersistableProviderOutputIsReturned() {
        responseBody = geminiResponse("""
                {"score":80,"recommendation":"REVIEW","summary":"Contact jane.doe@example.com or +84 912 345 678.",
                "matchedCriteria":["https://linkedin.example/jane"],"missingCriteria":[],"limitations":[]}
                """);

        CvScreeningResult result = client().screen(validRequest());

        assertEquals("Contact [redacted-email] or [redacted-phone].", result.summary());
        assertEquals(List.of("[redacted-url]"), result.matchedCriteria());
    }

    private GeminiCvScreeningClient client() {
        GeminiCvScreeningProperties properties = configuredProperties();
        RestClient restClient = RestClient.builder()
                .baseUrl(properties.getApiBaseUrl())
                .build();
        return new GeminiCvScreeningClient(restClient, objectMapper, properties);
    }

    private GeminiCvScreeningProperties configuredProperties() {
        GeminiCvScreeningProperties properties = new GeminiCvScreeningProperties();
        properties.setEnabled(true);
        properties.setApiBaseUrl(URI.create("http://localhost:" + server.getAddress().getPort()));
        properties.setAllowInsecureEndpoint(true);
        properties.setApiKey("test-api-key");
        properties.setModel("gemini-2.5-flash");
        return properties;
    }

    private CvScreeningRequest validRequest() {
        return new CvScreeningRequest(
                "Backend Engineer",
                "Build Java services.",
                List.of("Java"),
                "Five years of Java experience."
        );
    }

    private void handleRequest(HttpExchange exchange) throws IOException {
        requestBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
        apiKey.set(exchange.getRequestHeaders().getFirst("x-goog-api-key"));
        byte[] response = responseBody.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(responseStatus, response.length);
        exchange.getResponseBody().write(response);
        exchange.close();
    }

    private static String geminiResponse(String result) {
        return """
                {"candidates":[{"content":{"parts":[{"text":%s}]}}]}
                """.formatted(jsonString(result));
    }

    private static String jsonString(String value) {
        return '"' + value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") + '"';
    }
}
