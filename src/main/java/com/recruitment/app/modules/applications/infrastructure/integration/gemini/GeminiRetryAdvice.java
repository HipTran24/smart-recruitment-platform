package com.recruitment.app.modules.applications.infrastructure.integration.gemini;

import org.springframework.web.client.RestClientResponseException;
import tools.jackson.databind.ObjectMapper;

import java.time.Clock;
import java.time.Duration;
import java.time.ZonedDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/** Reads only retry metadata; provider messages, CV data and credentials are never persisted. */
final class GeminiRetryAdvice {
    private GeminiRetryAdvice() {}

    static Duration delay(RestClientResponseException response, ObjectMapper mapper, Clock clock) {
        Duration delay = Duration.ZERO;
        boolean daily = false;
        try {
            var details = mapper.readTree(response.getResponseBodyAsString()).path("error").path("details");
            for (var detail : details) {
                if (detail.path("@type").asText().endsWith("RetryInfo"))
                    delay = maximum(delay, seconds(detail.path("retryDelay").asText().replaceFirst("s$", "")));
                for (var violation : detail.path("violations"))
                    daily |= violation.path("quotaId").asText().contains("PerDay");
            }
        } catch (RuntimeException ignored) { /* Malformed advice uses a bounded fallback. */ }
        String header = response.getResponseHeaders() == null ? null : response.getResponseHeaders().getFirst("Retry-After");
        if (header != null) {
            try { delay = maximum(delay, seconds(header)); }
            catch (RuntimeException ignored) {
                try { delay = maximum(delay, Duration.between(clock.instant(), ZonedDateTime.parse(header, DateTimeFormatter.RFC_1123_DATE_TIME).toInstant())); }
                catch (RuntimeException invalidHeader) { /* Use JSON advice or fallback. */ }
            }
        }
        if (delay.isZero() || delay.isNegative()) {
            delay = daily ? Duration.between(clock.instant(), clock.instant().atZone(ZoneId.of("America/Los_Angeles"))
                    .toLocalDate().plusDays(1).atStartOfDay(ZoneId.of("America/Los_Angeles")).toInstant()) : Duration.ofMinutes(1);
        }
        // A small margin prevents another request just before the provider's window opens.
        return maximum(Duration.ofSeconds(1), delay.plusSeconds(5));
    }

    private static Duration maximum(Duration a, Duration b) { return a.compareTo(b) >= 0 ? a : b; }

    private static Duration seconds(String value) {
        double seconds = Double.parseDouble(value);
        if (!Double.isFinite(seconds) || seconds < 0 || seconds > Duration.ofDays(2).toSeconds())
            throw new IllegalArgumentException("Invalid provider retry duration");
        return Duration.ofMillis((long) Math.ceil(seconds * 1000));
    }
}
