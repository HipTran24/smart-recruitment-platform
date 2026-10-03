package com.recruitment.app.modules.identity.application;

import com.recruitment.app.modules.identity.application.exception.AuthenticationThrottledException;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * In-memory sliding-window throttling service that locks out brute-force
 * login attempts.
 */
@Service
public class AuthenticationThrottlingService {

    private static final int DEFAULT_MAX_ATTEMPTS = 5;
    private static final Duration DEFAULT_WINDOW = Duration.ofMinutes(15);

    private final Clock clock;
    private final int maxAttempts;
    private final Duration windowDuration;
    private final ConcurrentMap<String, AttemptRecord> attempts = new ConcurrentHashMap<>();

    public AuthenticationThrottlingService() {
        this(Clock.systemUTC(), DEFAULT_MAX_ATTEMPTS, DEFAULT_WINDOW);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public AuthenticationThrottlingService(Clock clock) {
        this(clock, DEFAULT_MAX_ATTEMPTS, DEFAULT_WINDOW);
    }

    public AuthenticationThrottlingService(Clock clock, int maxAttempts, Duration windowDuration) {
        this.clock = Objects.requireNonNull(clock, "clock must not be null");
        this.maxAttempts = maxAttempts <= 0 ? DEFAULT_MAX_ATTEMPTS : maxAttempts;
        this.windowDuration = Objects.requireNonNull(windowDuration, "window duration must not be null");
    }

    public void checkThrottled(String key) {
        if (key == null || key.isBlank()) {
            return;
        }
        Instant now = clock.instant();
        AttemptRecord record = attempts.get(key.strip().toLowerCase());
        if (record != null && !record.isExpired(now, windowDuration) && record.count() >= maxAttempts) {
            throw new AuthenticationThrottledException();
        }
    }

    public void recordFailure(String key) {
        if (key == null || key.isBlank()) {
            return;
        }
        Instant now = clock.instant();
        String normalizedKey = key.strip().toLowerCase();
        attempts.compute(normalizedKey, (k, existing) -> {
            if (existing == null || existing.isExpired(now, windowDuration)) {
                return new AttemptRecord(1, now);
            }
            return new AttemptRecord(existing.count() + 1, existing.firstAttemptAt());
        });
    }

    public void recordSuccess(String key) {
        if (key == null || key.isBlank()) {
            return;
        }
        attempts.remove(key.strip().toLowerCase());
    }

    public void resetAll() {
        attempts.clear();
    }

    private record AttemptRecord(int count, Instant firstAttemptAt) {
        boolean isExpired(Instant now, Duration window) {
            return now.isAfter(firstAttemptAt.plus(window));
        }
    }
}
