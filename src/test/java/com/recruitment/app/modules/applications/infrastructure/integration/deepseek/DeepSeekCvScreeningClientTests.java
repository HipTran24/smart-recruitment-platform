package com.recruitment.app.modules.applications.infrastructure.integration.deepseek;

import com.recruitment.app.modules.applications.application.screening.*;
import com.recruitment.app.modules.applications.infrastructure.integration.gemini.GeminiCvScreeningConfiguration;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.*;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

class DeepSeekCvScreeningClientTests {
    private final JsonMapper mapper = new JsonMapper();
    private HttpServer server;
    private String requestBody;
    private String authorization;
    private int status = 200;
    private String body;

    @BeforeEach void start() throws Exception {
        body = envelope("""
                {"score":70,"recommendation":"REVIEW","summary":"Ứng viên có kinh nghiệm Java.",
                "matchedCriteria":["Java"],"missingCriteria":["SQL"],"limitations":["Cần kiểm chứng kinh nghiệm."]}
                """, "stop");
        server = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
        server.createContext("/chat/completions", exchange -> {
            requestBody = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            authorization = exchange.getRequestHeaders().getFirst("Authorization");
            var bytes = body.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.getResponseHeaders().set("Retry-After", "120");
            exchange.sendResponseHeaders(status, bytes.length); exchange.getResponseBody().write(bytes); exchange.close();
        });
        server.start();
    }
    @AfterEach void stop() { server.stop(0); }

    @Test void authenticatesAndPersistsValidatedVietnameseResultsWithActualProviderMetadata() {
        var result = client().screen(request());
        assertEquals(70, result.score()); assertEquals("deepseek", result.provider());
        assertEquals("deepseek-flash", result.model());
        assertEquals(CvScreeningPolicy.DEEPSEEK_PROMPT_VERSION, result.promptVersion());
        assertEquals("Bearer test-key", authorization);
        var payload = mapper.readTree(requestBody);
        assertEquals("json_object", payload.path("response_format").path("type").asText());
        assertEquals("disabled", payload.path("thinking").path("type").asText());
        assertTrue(requestBody.contains("Vietnamese"));
        assertFalse(requestBody.contains("person@example.test"));
        assertFalse(requestBody.contains("+84 912 345 678"));
    }

    @Test void rejectsBlankOrTruncatedJsonSoItCannotBeSavedAsCompleted() {
        body = envelope(" ", "stop");
        var blank = assertThrows(CvScreeningException.class, () -> client().screen(request()));
        assertEquals(CvScreeningException.Reason.INVALID_PROVIDER_RESPONSE, blank.getReason());
        assertTrue(blank.isRetryable());
        body = envelope("{\"score\":70", "length");
        assertThrows(CvScreeningException.class, () -> client().screen(request()));
    }

    @Test void rejectsMissingRequiredFieldsAndInvalidScores() {
        body = envelope("{\"score\":101}", "stop");
        assertThrows(CvScreeningException.class, () -> client().screen(request()));
        body = envelope("{\"score\":70,\"recommendation\":\"REVIEW\",\"summary\":\"Nội dung\"}", "stop");
        assertThrows(CvScreeningException.class, () -> client().screen(request()));
    }

    @Test void honorsRateLimitAdviceAndDoesNotExposeRawErrorBodies() {
        status = 429; body = "{\"error\":{\"message\":\"private-provider-detail\"}}";
        var failure = assertThrows(CvScreeningException.class, () -> client().screen(request()));
        assertEquals(CvScreeningException.Reason.QUOTA_EXHAUSTED, failure.getReason());
        assertEquals(java.time.Duration.ofSeconds(125), failure.getRetryAfter());
        assertFalse(failure.getMessage().contains("private-provider-detail"));
    }

    @Test void reportsInsufficientBalanceWithoutRetryingForever() {
        status = 402;
        var failure = assertThrows(CvScreeningException.class, () -> client().screen(request()));
        assertEquals(CvScreeningException.Reason.PAYMENT_REQUIRED, failure.getReason());
        assertFalse(failure.isRetryable());
        assertEquals("PROVIDER_BALANCE_EXHAUSTED", CvScreeningFailure.from(failure).code());
    }

    @Test void refusesNonLocalInsecureEndpoints() {
        var properties = properties(); properties.setApiBaseUrl(URI.create("http://external.example.test"));
        assertThrows(CvScreeningException.class, properties::validate);
    }

    @Test void deepSeekTakesPrecedenceWhenBothProviderFlagsAreEnabled() {
        new ApplicationContextRunner().withUserConfiguration(DeepSeekCvScreeningConfiguration.class, GeminiCvScreeningConfiguration.class)
                .withBean(ObjectMapper.class, JsonMapper::new)
                .withPropertyValues("app.ai.deepseek.enabled=true", "app.ai.deepseek.api-key=test-key", "app.ai.gemini.enabled=true")
                .run(context -> {
                    assertNull(context.getStartupFailure());
                    assertEquals(1, context.getBeansOfType(CvScreeningGateway.class).size());
                    assertInstanceOf(DeepSeekCvScreeningClient.class, context.getBean(CvScreeningGateway.class));
                });
    }

    private DeepSeekCvScreeningClient client() {
        var properties = properties();
        return new DeepSeekCvScreeningClient(RestClient.builder().baseUrl(properties.getApiBaseUrl().toString()).build(), mapper, properties);
    }
    private DeepSeekCvScreeningProperties properties() {
        var properties = new DeepSeekCvScreeningProperties(); properties.setEnabled(true); properties.setApiKey("test-key");
        properties.setApiBaseUrl(URI.create("http://localhost:" + server.getAddress().getPort())); properties.setAllowInsecureEndpoint(true);
        return properties;
    }
    private CvScreeningRequest request() {
        return new CvScreeningRequest("Java", "Backend services", List.of("Java", "SQL"), "Java experience. person@example.test +84 912 345 678");
    }
    private String envelope(String content, String finish) {
        return mapper.writeValueAsString(Map.of("model", "deepseek-flash", "choices", List.of(Map.of("finish_reason", finish, "message", Map.of("content", content)))));
    }
}
