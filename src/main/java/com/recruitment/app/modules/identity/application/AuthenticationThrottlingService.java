package com.recruitment.app.modules.identity.application;

import com.recruitment.app.modules.identity.application.exception.AuthenticationThrottledException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Sliding-window multi-dimensional throttling service that locks out brute-force attempts
 * while bounding memory consumption to prevent denial-of-service.
 */
@Service
public class AuthenticationThrottlingService {

    public static final int DEFAULT_MAX_ATTEMPTS = 5;
    public static final int DEFAULT_IP_MAX_ATTEMPTS = 50;
    public static final int DEFAULT_ACCOUNT_MAX_ATTEMPTS = 25;
    public static final int MAX_ENTRIES = 10_000;
    public static final Duration DEFAULT_WINDOW = Duration.ofMinutes(15);

    private final Clock clock;
    private final int maxAttempts;
    private final int maxIpAttempts;
    private final int maxAccountAttempts;
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
        this(clock, maxAttempts, DEFAULT_IP_MAX_ATTEMPTS, DEFAULT_ACCOUNT_MAX_ATTEMPTS, windowDuration);
    }

    public AuthenticationThrottlingService(
            Clock clock,
            int maxAttempts,
            int maxIpAttempts,
            int maxAccountAttempts,
            Duration windowDuration
    ) {
        this.clock = Objects.requireNonNull(clock, "clock must not be null");
        this.maxAttempts = maxAttempts <= 0 ? DEFAULT_MAX_ATTEMPTS : maxAttempts;
        this.maxIpAttempts = maxIpAttempts <= 0 ? DEFAULT_IP_MAX_ATTEMPTS : maxIpAttempts;
        this.maxAccountAttempts = maxAccountAttempts <= 0 ? DEFAULT_ACCOUNT_MAX_ATTEMPTS : maxAccountAttempts;
        this.windowDuration = Objects.requireNonNull(windowDuration, "window duration must not be null");
    }

    public void checkThrottled(String key) {
        if (key == null || key.isBlank()) {
            return;
        }
        String ip = currentClientIp();
        if (ip != null) {
            checkThrottled(ip, key);
        } else {
            checkKey(key.strip().toLowerCase(), maxAttempts);
        }
    }

    public void checkThrottled(String ip, String email) {
        Instant now = clock.instant();
        if (ip != null && !ip.isBlank()) {
            checkKey("ip:" + ip.strip().toLowerCase(), maxIpAttempts);
        }
        if (email != null && !email.isBlank()) {
            checkKey("account:" + email.strip().toLowerCase(), maxAccountAttempts);
        }
        if (ip != null && !ip.isBlank() && email != null && !email.isBlank()) {
            checkKey("pair:" + ip.strip().toLowerCase() + ":" + email.strip().toLowerCase(), maxAttempts);
        }
    }

    public void recordFailure(String key) {
        if (key == null || key.isBlank()) {
            return;
        }
        String ip = currentClientIp();
        if (ip != null) {
            recordFailure(ip, key);
        } else {
            recordKeyFailure(key.strip().toLowerCase());
        }
    }

    public void recordFailure(String ip, String email) {
        if (ip != null && !ip.isBlank()) {
            recordKeyFailure("ip:" + ip.strip().toLowerCase());
        }
        if (email != null && !email.isBlank()) {
            recordKeyFailure("account:" + email.strip().toLowerCase());
        }
        if (ip != null && !ip.isBlank() && email != null && !email.isBlank()) {
            recordKeyFailure("pair:" + ip.strip().toLowerCase() + ":" + email.strip().toLowerCase());
        }
    }

    public void recordSuccess(String key) {
        if (key == null || key.isBlank()) {
            return;
        }
        String ip = currentClientIp();
        if (ip != null) {
            recordSuccess(ip, key);
        } else {
            attempts.remove(key.strip().toLowerCase());
        }
    }

    public void recordSuccess(String ip, String email) {
        if (email != null && !email.isBlank()) {
            attempts.remove("account:" + email.strip().toLowerCase());
            if (ip != null && !ip.isBlank()) {
                attempts.remove("pair:" + ip.strip().toLowerCase() + ":" + email.strip().toLowerCase());
            }
        }
    }

    public int size() {
        return attempts.size();
    }

    public void resetAll() {
        attempts.clear();
    }

    private void checkKey(String normalizedKey, int threshold) {
        Instant now = clock.instant();
        AttemptRecord record = attempts.get(normalizedKey);
        if (record != null && !record.isExpired(now, windowDuration) && record.count() >= threshold) {
            long remainingSeconds = Math.max(1L, Duration.between(now, record.firstAttemptAt().plus(windowDuration)).toSeconds());
            throw new AuthenticationThrottledException(remainingSeconds);
        }
    }

    private void recordKeyFailure(String normalizedKey) {
        ensureCapacity();
        Instant now = clock.instant();
        attempts.compute(normalizedKey, (k, existing) -> {
            if (existing == null || existing.isExpired(now, windowDuration)) {
                return new AttemptRecord(1, now);
            }
            return new AttemptRecord(existing.count() + 1, existing.firstAttemptAt());
        });
    }

    private void ensureCapacity() {
        if (attempts.size() < MAX_ENTRIES) {
            return;
        }
        Instant now = clock.instant();
        attempts.entrySet().removeIf(entry -> entry.getValue().isExpired(now, windowDuration));
        if (attempts.size() >= MAX_ENTRIES) {
            attempts.entrySet().stream()
                    .min(Comparator.comparing(e -> e.getValue().firstAttemptAt()))
                    .ifPresent(oldest -> attempts.remove(oldest.getKey()));
        }
    }

    private static String currentClientIp() {
        RequestAttributes attrs = RequestContextHolder.getRequestAttributes();
        if (attrs instanceof ServletRequestAttributes servletAttrs) {
            HttpServletRequest request = servletAttrs.getRequest();
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                return forwarded.split(",")[0].strip();
            }
            return request.getRemoteAddr();
        }
        return null;
    }

    private record AttemptRecord(int count, Instant firstAttemptAt) {
        boolean isExpired(Instant now, Duration window) {
            return now.isAfter(firstAttemptAt.plus(window));
        }
    }
}
