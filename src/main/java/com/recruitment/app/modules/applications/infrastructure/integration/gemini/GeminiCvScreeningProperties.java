package com.recruitment.app.modules.applications.infrastructure.integration.gemini;

import com.recruitment.app.modules.applications.application.screening.CvScreeningException;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.net.URI;
import java.time.Duration;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Configuration for the Gemini Developer API adapter. API credentials must be supplied only by
 * the runtime secret store (normally {@code GEMINI_API_KEY}); this class deliberately has no key
 * default.
 */
@ConfigurationProperties(prefix = "app.ai.gemini")
public class GeminiCvScreeningProperties {

    private static final Pattern MODEL_NAME = Pattern.compile("[A-Za-z0-9._-]{1,128}");

    private boolean enabled;
    private URI apiBaseUrl = URI.create("https://generativelanguage.googleapis.com");
    private String apiVersion = "v1beta";
    private String apiKey;
    private String model;
    private Duration connectTimeout = Duration.ofSeconds(3);
    private Duration readTimeout = Duration.ofSeconds(30);
    private int maxResumeCharacters = 60_000;
    private int maxJobDescriptionCharacters = 24_000;
    private int maxRequiredCriteria = 40;
    private int maxOutputTokens = 1_024;
    private boolean allowInsecureEndpoint;

    public void validateOperationalConfiguration() {
        if (!enabled) {
            throw configurationError("Gemini CV screening is disabled");
        }
        if (apiKey == null || apiKey.isBlank()) {
            throw configurationError("Gemini API key is required when CV screening is enabled");
        }
        if (model == null || !MODEL_NAME.matcher(model).matches()) {
            throw configurationError("Gemini model must contain only letters, digits, '.', '_' or '-'");
        }
        if (apiBaseUrl == null || apiBaseUrl.getScheme() == null || apiBaseUrl.getHost() == null
                || apiBaseUrl.getUserInfo() != null || apiBaseUrl.getQuery() != null || apiBaseUrl.getFragment() != null) {
            throw configurationError("Gemini API base URL is invalid");
        }
        String scheme = apiBaseUrl.getScheme().toLowerCase(Locale.ROOT);
        if (!"https".equals(scheme) && !"http".equals(scheme)) {
            throw configurationError("Gemini API base URL must use HTTP or HTTPS");
        }
        if ("http".equals(scheme) && (!allowInsecureEndpoint || !isLoopbackHost(apiBaseUrl.getHost()))) {
            throw configurationError("Gemini API base URL must use HTTPS; insecure endpoints are limited to local testing");
        }
        if (apiVersion == null || !apiVersion.matches("v[0-9]+(?:[A-Za-z0-9._-]+)?")) {
            throw configurationError("Gemini API version is invalid");
        }
        validateDuration(connectTimeout, "Gemini connect timeout");
        validateDuration(readTimeout, "Gemini read timeout");
        validateRange(maxResumeCharacters, 1_000, 120_000, "Gemini max resume characters");
        validateRange(maxJobDescriptionCharacters, 1_000, 120_000, "Gemini max job description characters");
        validateRange(maxRequiredCriteria, 1, 100, "Gemini max required criteria");
        validateRange(maxOutputTokens, 128, 8_192, "Gemini max output tokens");
    }

    private static void validateDuration(Duration value, String field) {
        if (value == null || value.isNegative() || value.isZero() || value.compareTo(Duration.ofMinutes(2)) > 0) {
            throw configurationError(field + " must be greater than zero and no more than two minutes");
        }
    }

    private static void validateRange(int value, int minimum, int maximum, String field) {
        if (value < minimum || value > maximum) {
            throw configurationError(field + " is outside its supported range");
        }
    }

    private static boolean isLoopbackHost(String host) {
        return "localhost".equalsIgnoreCase(host)
                || "127.0.0.1".equals(host)
                || "::1".equals(host);
    }

    private static CvScreeningException configurationError(String message) {
        return new CvScreeningException(CvScreeningException.Reason.NOT_CONFIGURED, false, message);
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public URI getApiBaseUrl() {
        return apiBaseUrl;
    }

    public void setApiBaseUrl(URI apiBaseUrl) {
        this.apiBaseUrl = apiBaseUrl;
    }

    public String getApiVersion() {
        return apiVersion;
    }

    public void setApiVersion(String apiVersion) {
        this.apiVersion = apiVersion;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Duration getConnectTimeout() {
        return connectTimeout;
    }

    public void setConnectTimeout(Duration connectTimeout) {
        this.connectTimeout = connectTimeout;
    }

    public Duration getReadTimeout() {
        return readTimeout;
    }

    public void setReadTimeout(Duration readTimeout) {
        this.readTimeout = readTimeout;
    }

    public int getMaxResumeCharacters() {
        return maxResumeCharacters;
    }

    public void setMaxResumeCharacters(int maxResumeCharacters) {
        this.maxResumeCharacters = maxResumeCharacters;
    }

    public int getMaxJobDescriptionCharacters() {
        return maxJobDescriptionCharacters;
    }

    public void setMaxJobDescriptionCharacters(int maxJobDescriptionCharacters) {
        this.maxJobDescriptionCharacters = maxJobDescriptionCharacters;
    }

    public int getMaxRequiredCriteria() {
        return maxRequiredCriteria;
    }

    public void setMaxRequiredCriteria(int maxRequiredCriteria) {
        this.maxRequiredCriteria = maxRequiredCriteria;
    }

    public int getMaxOutputTokens() {
        return maxOutputTokens;
    }

    public void setMaxOutputTokens(int maxOutputTokens) {
        this.maxOutputTokens = maxOutputTokens;
    }

    public boolean isAllowInsecureEndpoint() {
        return allowInsecureEndpoint;
    }

    public void setAllowInsecureEndpoint(boolean allowInsecureEndpoint) {
        this.allowInsecureEndpoint = allowInsecureEndpoint;
    }
}
