package com.recruitment.app.modules.identity.infrastructure.integration.email;

import com.recruitment.app.modules.identity.application.port.out.AccountNotificationGateway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

import com.recruitment.app.modules.identity.application.port.out.TestNotificationInspector;

/**
 * Baseline notification gateway implementation that logs security dispatch events
 * and retains recent tokens in bounded FIFO memory with TTL for test and development inspection.
 */
@Component
@ConditionalOnProperty(name = "app.notification.provider", havingValue = "logging", matchIfMissing = true)
public class LoggingAccountNotificationGateway implements AccountNotificationGateway, TestNotificationInspector {

    private static final Logger log = LoggerFactory.getLogger(LoggingAccountNotificationGateway.class);
    private static final int MAX_RETAINED_TOKENS = 200;
    private static final Duration TOKEN_TTL = Duration.ofMinutes(15);

    private record TokenEntry(String token, Instant recordedAt) {}

    private final Map<String, TokenEntry> latestResetTokens = createBoundedMap();
    private final Map<String, TokenEntry> latestVerificationTokens = createBoundedMap();

    @Override
    public void sendPasswordResetNotification(String email, String rawToken) {
        if (email != null && rawToken != null) {
            latestResetTokens.put(email.strip().toLowerCase(), new TokenEntry(rawToken, Instant.now()));
        }
        log.info("Recorded password reset instructions (in-memory test/logging provider; no external email dispatched) for recipient: {}", email);
    }

    @Override
    public void sendEmailVerificationNotification(String email, String rawToken) {
        if (email != null && rawToken != null) {
            latestVerificationTokens.put(email.strip().toLowerCase(), new TokenEntry(rawToken, Instant.now()));
        }
        log.info("Recorded email verification instructions (in-memory test/logging provider; no external email dispatched) for recipient: {}", email);
    }

    @org.springframework.context.event.EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
    public void warnIfRunningInProduction(org.springframework.boot.context.event.ApplicationReadyEvent event) {
        var env = event.getApplicationContext().getEnvironment();
        var activeProfiles = java.util.List.of(env.getActiveProfiles());
        if (activeProfiles.contains("prod") || activeProfiles.contains("production")) {
            log.warn("SECURITY WARNING: Running with 'logging' notification provider in production. Plaintext tokens are retained in memory and no external email is dispatched.");
        }
    }

    public Optional<String> getLatestResetToken(String email) {
        return resolveValidToken(latestResetTokens, email, false);
    }

    public Optional<String> consumeLatestResetToken(String email) {
        return resolveValidToken(latestResetTokens, email, true);
    }

    public Optional<String> getLatestVerificationToken(String email) {
        return resolveValidToken(latestVerificationTokens, email, false);
    }

    public Optional<String> consumeLatestVerificationToken(String email) {
        return resolveValidToken(latestVerificationTokens, email, true);
    }

    public void clear() {
        latestResetTokens.clear();
        latestVerificationTokens.clear();
    }

    private Optional<String> resolveValidToken(Map<String, TokenEntry> map, String email, boolean consume) {
        if (email == null) {
            return Optional.empty();
        }
        String key = email.strip().toLowerCase();
        TokenEntry entry = consume ? map.remove(key) : map.get(key);
        if (entry == null) {
            return Optional.empty();
        }
        if (Instant.now().isAfter(entry.recordedAt().plus(TOKEN_TTL))) {
            if (!consume) {
                map.remove(key);
            }
            return Optional.empty();
        }
        return Optional.of(entry.token());
    }

    private static Map<String, TokenEntry> createBoundedMap() {
        return Collections.synchronizedMap(new LinkedHashMap<>(32, 0.75f, false) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<String, TokenEntry> eldest) {
                return size() > MAX_RETAINED_TOKENS;
            }
        });
    }
}
