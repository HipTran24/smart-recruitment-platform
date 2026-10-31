package com.recruitment.app.modules.applications.infrastructure.integration.gemini;

import com.recruitment.app.modules.applications.application.screening.CvScreeningException;
import com.recruitment.app.modules.applications.application.screening.CvScreeningGateway;
import com.recruitment.app.modules.applications.application.screening.CvScreeningRequest;
import com.recruitment.app.modules.applications.application.screening.CvScreeningResult;
import com.recruitment.app.modules.applications.application.screening.CvScreeningPolicy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import com.recruitment.app.modules.applications.infrastructure.integration.shared.ScreeningContent;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/**
 * Gemini Developer API implementation of the CV-screening application port.
 *
 * <p>The request has a constrained JSON response schema and treats both the CV and job text as
 * untrusted data, so embedded prompt instructions cannot change the screening policy.</p>
 */
public final class GeminiCvScreeningClient implements CvScreeningGateway {

    private static final Logger log = LoggerFactory.getLogger(GeminiCvScreeningClient.class);
    static final String PROVIDER = "gemini";
    static final String PROMPT_VERSION = CvScreeningPolicy.PROMPT_VERSION;

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final GeminiCvScreeningProperties properties;
    private long nextRequestNanos;

    public GeminiCvScreeningClient(
            RestClient restClient,
            ObjectMapper objectMapper,
            GeminiCvScreeningProperties properties
    ) {
        this.restClient = requireNonNull(restClient, "rest client");
        this.objectMapper = requireNonNull(objectMapper, "object mapper");
        this.properties = requireNonNull(properties, "properties");
    }

    @Override
    public CvScreeningResult screen(CvScreeningRequest request) {
        properties.validateOperationalConfiguration();
        validateRequest(request);

        List<String> models = models();

        CvScreeningException lastQuotaException = null;
        for (int i = 0; i < models.size(); i++) {
            String currentModel = models.get(i);
            boolean hasNext = i + 1 < models.size();
            try {
                awaitRateSlot();

                return invokeModel(request, currentModel);
            } catch (CvScreeningException exception) {
                throw exception;
            } catch (RestClientResponseException exception) {
                if (exception.getStatusCode().value() == 429) {
                    lastQuotaException = new CvScreeningException(CvScreeningException.Reason.QUOTA_EXHAUSTED,
                            GeminiRetryAdvice.delay(exception, objectMapper, java.time.Clock.systemUTC()));
                    if (hasNext) {
                        log.warn("Gemini model {} quota exhausted (429), failing over to {}", currentModel, models.get(i + 1));
                        continue;
                    }
                    throw lastQuotaException;
                }
                if (exception.getStatusCode().value() == 404 && hasNext) {
                    log.warn("Gemini model {} not found (404), failing over to {}", currentModel, models.get(i + 1));
                    continue;
                }
                boolean retryable = exception.getStatusCode().is5xxServerError();
                throw new CvScreeningException(
                        retryable ? CvScreeningException.Reason.PROVIDER_UNAVAILABLE
                                : CvScreeningException.Reason.PROVIDER_REJECTED,
                        retryable,
                        "Gemini CV screening request was rejected with HTTP " + exception.getStatusCode().value(),
                        exception
                );
            } catch (RestClientException exception) {
                throw new CvScreeningException(
                        CvScreeningException.Reason.PROVIDER_UNAVAILABLE,
                        true,
                        "Gemini CV screening service is unavailable",
                        exception
                );
            }
        }
        if (lastQuotaException != null) throw lastQuotaException;
        throw new CvScreeningException(CvScreeningException.Reason.PROVIDER_UNAVAILABLE, true, "No Gemini model could be invoked");
    }

    private List<String> models() {
        var models = new ArrayList<String>(); models.add(properties.getModel());
        if (properties.getFallbackModels() != null && !properties.getFallbackModels().isBlank()) {
            for (String fallback : properties.getFallbackModels().split(",")) {
                String model = fallback.strip();
                if (!model.isBlank() && !models.contains(model)) models.add(model);
            }
        }
        return models;
    }

    private CvScreeningResult invokeModel(CvScreeningRequest request, String model) {
        String body = restClient.post()
                .uri("/{apiVersion}/models/{model}:generateContent", properties.getApiVersion(), model)
                .header("x-goog-api-key", properties.getApiKey())
                .contentType(MediaType.APPLICATION_JSON).accept(MediaType.APPLICATION_JSON)
                .body(buildProviderRequest(request, model)).retrieve().requiredBody(String.class);
        return parseProviderResponse(body, model);
    }

    private void awaitRateSlot() {
        long delay;
        synchronized (this) {
            long now = System.nanoTime();
            long slot = Math.max(now, nextRequestNanos);
            nextRequestNanos = slot + properties.getMinRequestInterval().toNanos();
            delay = slot - now;
        }
        if (delay <= 0) return;
        try { Thread.sleep(java.time.Duration.ofNanos(delay)); }
        catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new CvScreeningException(CvScreeningException.Reason.PROVIDER_UNAVAILABLE, true, "Gemini request was interrupted");
        }
    }

    private void validateRequest(CvScreeningRequest request) {
        if (request == null) {
            throw invalidInput("CV screening request is required");
        }
        if (request.resumeText().length() > properties.getMaxResumeCharacters()) {
            throw invalidInput("resume text exceeds the configured Gemini limit");
        }
        if (request.jobDescription().length() > properties.getMaxJobDescriptionCharacters()) {
            throw invalidInput("job description exceeds the configured Gemini limit");
        }
        if (request.requiredCriteria().size() > properties.getMaxRequiredCriteria()) {
            throw invalidInput("required criteria exceed the configured Gemini limit");
        }
    }

    private Map<String, Object> buildProviderRequest(CvScreeningRequest request, String model) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("systemInstruction", Map.of("parts", List.of(Map.of("text", ScreeningContent.SYSTEM_INSTRUCTION))));
        payload.put("contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text", ScreeningContent.prompt(request))))));
        Map<String, Object> generation = new LinkedHashMap<>(Map.of(
                "temperature", 0,
                "maxOutputTokens", properties.getMaxOutputTokens(),
                "responseMimeType", "application/json",
                "responseSchema", responseSchema()
        ));
        if (model != null && model.startsWith("gemini-2.5-flash")) {
            generation.put("thinkingConfig", Map.of("thinkingBudget", 0));
        }
        payload.put("generationConfig", generation);
        payload.put("safetySettings", List.of(
                safetySetting("HARM_CATEGORY_HATE_SPEECH"),
                safetySetting("HARM_CATEGORY_HARASSMENT"),
                safetySetting("HARM_CATEGORY_SEXUALLY_EXPLICIT"),
                safetySetting("HARM_CATEGORY_DANGEROUS_CONTENT")
        ));
        return payload;
    }

    private static Map<String, Object> safetySetting(String category) {
        return Map.of("category", category, "threshold", "BLOCK_MEDIUM_AND_ABOVE");
    }

    private static Map<String, Object> responseSchema() {
        Map<String, Object> stringArray = Map.of(
                "type", "array",
                "items", Map.of("type", "string"),
                "maxItems", 40
        );
        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put("score", Map.of("type", "integer", "minimum", 0, "maximum", 100));
        properties.put("recommendation", Map.of(
                "type", "string",
                "enum", List.of("RECOMMENDED", "REVIEW", "NOT_RECOMMENDED")
        ));
        properties.put("summary", Map.of("type", "string"));
        properties.put("matchedCriteria", stringArray);
        properties.put("missingCriteria", stringArray);
        properties.put("limitations", stringArray);
        return Map.of(
                "type", "object",
                "required", List.of("score", "recommendation", "summary", "matchedCriteria", "missingCriteria", "limitations"),
                "properties", properties
        );
    }

    private CvScreeningResult parseProviderResponse(String providerResponse, String model) {
        if (providerResponse == null || providerResponse.isBlank()) {
            throw invalidProviderResponse("Gemini returned an empty CV screening response");
        }
        try {
            JsonNode root = objectMapper.readTree(providerResponse);
            JsonNode candidates = root.path("candidates");
            if (!candidates.isArray() || candidates.isEmpty()) {
                throw new CvScreeningException(
                        CvScreeningException.Reason.PROVIDER_REJECTED,
                        false,
                        "Gemini did not return a usable CV screening candidate"
                );
            }

            String generatedJson = firstTextPart(candidates.get(0));
            JsonNode result = objectMapper.readTree(ScreeningContent.stripJsonFence(generatedJson));
            return ScreeningContent.parse(result, PROVIDER, model, PROMPT_VERSION);
        } catch (CvScreeningException exception) {
            throw exception;
        } catch (JacksonException | IllegalArgumentException exception) {
            throw invalidProviderResponse("Gemini returned an invalid CV screening response", exception);
        }
    }

    private static String firstTextPart(JsonNode candidate) {
        JsonNode parts = candidate.path("content").path("parts");
        if (!parts.isArray()) {
            throw invalidProviderResponse("Gemini response did not contain CV screening content");
        }
        for (JsonNode part : parts) {
            if (part.path("thought").asBoolean(false)) continue;
            JsonNode text = part.get("text");
            if (text != null && text.isTextual() && !text.asText().isBlank()) {
                return text.asText();
            }
        }
        throw invalidProviderResponse("Gemini response did not contain a CV screening result");
    }

    private static CvScreeningException invalidInput(String message) {
        return new CvScreeningException(CvScreeningException.Reason.INVALID_INPUT, false, message);
    }

    private static CvScreeningException invalidProviderResponse(String message) {
        return invalidProviderResponse(message, null);
    }

    private static CvScreeningException invalidProviderResponse(String message, Throwable cause) {
        return cause == null
                ? new CvScreeningException(CvScreeningException.Reason.INVALID_PROVIDER_RESPONSE, false, message)
                : new CvScreeningException(CvScreeningException.Reason.INVALID_PROVIDER_RESPONSE, false, message, cause);
    }

    private static <T> T requireNonNull(T value, String field) {
        if (value == null) {
            throw new IllegalArgumentException(field + " must not be null");
        }
        return value;
    }
}
