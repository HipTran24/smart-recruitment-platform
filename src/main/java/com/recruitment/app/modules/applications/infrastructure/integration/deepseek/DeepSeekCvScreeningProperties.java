package com.recruitment.app.modules.applications.infrastructure.integration.deepseek;

import com.recruitment.app.modules.applications.application.screening.CvScreeningException;
import org.springframework.boot.context.properties.ConfigurationProperties;
import lombok.Getter;
import lombok.Setter;
import java.net.URI;
import java.time.Duration;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.ai.deepseek")
public class DeepSeekCvScreeningProperties {
    private boolean enabled;
    private URI apiBaseUrl = URI.create("https://api.deepseek.com");
    private String apiKey;
    private String model = "deepseek-flash";
    private Duration connectTimeout = Duration.ofSeconds(3);
    private Duration readTimeout = Duration.ofSeconds(45);
    private int maxOutputTokens = 2048;
    private boolean allowInsecureEndpoint;

    public void validate() {
        if (!enabled || apiKey == null || apiKey.isBlank()) throw invalid("DeepSeek is not configured");
        if (model == null || !model.matches("[A-Za-z0-9._-]{1,128}")) throw invalid("Invalid DeepSeek model");
        if (apiBaseUrl == null || apiBaseUrl.getHost() == null || apiBaseUrl.getUserInfo() != null
                || apiBaseUrl.getQuery() != null || apiBaseUrl.getFragment() != null) throw invalid("Invalid DeepSeek URL");
        boolean local = java.util.Set.of("localhost", "127.0.0.1", "::1", "[::1]").contains(apiBaseUrl.getHost());
        if (!"https".equals(apiBaseUrl.getScheme()) && !("http".equals(apiBaseUrl.getScheme()) && local && allowInsecureEndpoint))
            throw invalid("DeepSeek requires HTTPS");
        validateTimeout(connectTimeout); validateTimeout(readTimeout);
        if (maxOutputTokens < 128 || maxOutputTokens > 8192) throw invalid("Invalid DeepSeek output token limit");
    }

    private static void validateTimeout(Duration duration) {
        if (duration == null || duration.isZero() || duration.isNegative() || duration.compareTo(Duration.ofMinutes(2)) > 0)
            throw invalid("Invalid DeepSeek timeout");
    }

    private static CvScreeningException invalid(String message) {
        return new CvScreeningException(CvScreeningException.Reason.NOT_CONFIGURED, false, message);
    }
}
