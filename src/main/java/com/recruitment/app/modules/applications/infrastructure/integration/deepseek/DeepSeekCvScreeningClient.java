package com.recruitment.app.modules.applications.infrastructure.integration.deepseek;

import com.recruitment.app.modules.applications.application.screening.*;
import com.recruitment.app.modules.applications.infrastructure.integration.shared.ScreeningContent;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import tools.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.util.List;
import java.util.Map;

public final class DeepSeekCvScreeningClient implements CvScreeningGateway {
    private final RestClient client;
    private final ObjectMapper mapper;
    private final DeepSeekCvScreeningProperties properties;

    public DeepSeekCvScreeningClient(RestClient client, ObjectMapper mapper, DeepSeekCvScreeningProperties properties) {
        this.client = client; this.mapper = mapper; this.properties = properties;
    }

    @Override
    public CvScreeningResult screen(CvScreeningRequest request) {
        properties.validate();
        if (request == null || request.resumeText().length() > 60_000 || request.jobDescription().length() > 24_000
                || request.requiredCriteria().size() > 40)
            throw new CvScreeningException(CvScreeningException.Reason.INVALID_INPUT, false, "Invalid CV screening input");
        try {
            String body = client.post().uri("/chat/completions")
                    .headers(headers -> headers.setBearerAuth(properties.getApiKey()))
                    .contentType(MediaType.APPLICATION_JSON).accept(MediaType.APPLICATION_JSON)
                    .body(payload(request)).retrieve().requiredBody(String.class);
            return parse(body);
        } catch (CvScreeningException failure) { throw failure; }
        catch (RestClientResponseException failure) {
            int status = failure.getStatusCode().value();
            if (status == 429) throw new CvScreeningException(CvScreeningException.Reason.QUOTA_EXHAUSTED, retryDelay(failure));
            if (status == 402) throw new CvScreeningException(CvScreeningException.Reason.PAYMENT_REQUIRED, false, "AI provider balance exhausted");
            boolean retryable = status >= 500;
            throw new CvScreeningException(retryable ? CvScreeningException.Reason.PROVIDER_UNAVAILABLE : CvScreeningException.Reason.PROVIDER_REJECTED,
                    retryable, "AI provider HTTP " + status);
        } catch (RestClientException failure) {
            throw new CvScreeningException(CvScreeningException.Reason.PROVIDER_UNAVAILABLE, true, "AI provider unavailable");
        }
    }

    private Map<String, Object> payload(CvScreeningRequest request) {
        String example = """
                Return exactly this JSON structure, using the actual evidence instead of example values:
                {"score":50,"recommendation":"REVIEW","summary":"Nhận xét bằng tiếng Việt.",
                 "matchedCriteria":["Tiêu chí có bằng chứng"],"missingCriteria":["Tiêu chí chưa có bằng chứng"],
                 "limitations":["Giới hạn của dữ liệu CV"]}
                score must be an integer from 0 to 100. recommendation must be RECOMMENDED, REVIEW or NOT_RECOMMENDED.
                Include all six keys. All human-readable values must be in Vietnamese. Keep the summary under 150 words.
                """;
        return Map.of("model", properties.getModel(), "stream", false, "temperature", 0,
                "thinking", Map.of("type", "disabled"), "response_format", Map.of("type", "json_object"),
                "max_tokens", properties.getMaxOutputTokens(), "messages", List.of(
                        Map.of("role", "system", "content", ScreeningContent.SYSTEM_INSTRUCTION + example),
                        Map.of("role", "user", "content", ScreeningContent.prompt(request))));
    }

    private CvScreeningResult parse(String body) {
        try {
            var root = mapper.readTree(body);
            var choice = root.path("choices").path(0);
            if (!"stop".equals(choice.path("finish_reason").asText())) throw invalidResponse();
            String content = choice.path("message").path("content").asText();
            if (content.isBlank()) throw invalidResponse();
            return ScreeningContent.parse(mapper.readTree(ScreeningContent.stripJsonFence(content)), "deepseek",
                    root.path("model").asText(properties.getModel()), CvScreeningPolicy.DEEPSEEK_PROMPT_VERSION);
        } catch (RuntimeException failure) { throw invalidResponse(); }
    }

    private static CvScreeningException invalidResponse() {
        return new CvScreeningException(CvScreeningException.Reason.INVALID_PROVIDER_RESPONSE, true, "Invalid AI screening response");
    }

    private static Duration retryDelay(RestClientResponseException failure) {
        String header = failure.getResponseHeaders() == null ? null : failure.getResponseHeaders().getFirst("Retry-After");
        try { return Duration.ofSeconds(Math.clamp(Long.parseLong(header), 1, 172800) + 5); }
        catch (RuntimeException ignored) { return Duration.ofSeconds(65); }
    }
}
