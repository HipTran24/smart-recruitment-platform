package com.recruitment.app.modules.identity.application;

import com.recruitment.app.modules.identity.application.exception.AuthenticationThrottledException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Multi-dimensional fixed-window rate limiter and lockout service.
 * Separates concerns by namespace (login credential lockout vs dispatch rate limiting).
 */
@Service
public class AuthenticationThrottlingService {

    public static final int DEFAULT_MAX_ATTEMPTS = 5;
    public static final int DEFAULT_IP_MAX_ATTEMPTS = 50;
    public static final int DEFAULT_ACCOUNT_MAX_ATTEMPTS = 25;
    public static final int DEFAULT_RESET_EMAIL_MAX_ATTEMPTS = 3;
    public static final int DEFAULT_RESET_IP_MAX_ATTEMPTS = 20;
    public static final int DEFAULT_VERIFY_IP_MAX_ATTEMPTS = 20;
    public static final int DEFAULT_REGISTER_IP_MAX_ATTEMPTS = 20;
    public static final int DEFAULT_REFRESH_IP_MAX_ATTEMPTS = 30;
    public static final int DEFAULT_OAUTH_IP_MAX_ATTEMPTS = 30;

    public static final int MAX_ENTRIES = 10_000;
    public static final Duration DEFAULT_WINDOW = Duration.ofMinutes(15);

    private final Clock clock;
    private final int maxAttempts;
    private final int maxIpAttempts;
    private final int maxAccountAttempts;
    private final Duration windowDuration;
    private final boolean trustForwardedHeader;
    private final ConcurrentMap<String, AttemptRecord> attempts = new ConcurrentHashMap<>();

    public AuthenticationThrottlingService() {
        this(Clock.systemUTC(), false);
    }

    public AuthenticationThrottlingService(Clock clock) {
        this(clock, false);
    }

    @Autowired
    public AuthenticationThrottlingService(
            Clock clock,
            @Value("${app.security.client-ip.trust-forwarded-header:false}") boolean trustForwardedHeader
    ) {
        this(clock, DEFAULT_MAX_ATTEMPTS, DEFAULT_IP_MAX_ATTEMPTS, DEFAULT_ACCOUNT_MAX_ATTEMPTS, DEFAULT_WINDOW, trustForwardedHeader);
    }

    public AuthenticationThrottlingService(Clock clock, int maxAttempts, Duration windowDuration) {
        this(clock, maxAttempts, DEFAULT_IP_MAX_ATTEMPTS, DEFAULT_ACCOUNT_MAX_ATTEMPTS, windowDuration, false);
    }

    public AuthenticationThrottlingService(
            Clock clock,
            int maxAttempts,
            int maxIpAttempts,
            int maxAccountAttempts,
            Duration windowDuration,
            boolean trustForwardedHeader
    ) {
        this.clock = Objects.requireNonNull(clock, "clock must not be null");
        this.maxAttempts = maxAttempts <= 0 ? DEFAULT_MAX_ATTEMPTS : maxAttempts;
        this.maxIpAttempts = maxIpAttempts <= 0 ? DEFAULT_IP_MAX_ATTEMPTS : maxIpAttempts;
        this.maxAccountAttempts = maxAccountAttempts <= 0 ? DEFAULT_ACCOUNT_MAX_ATTEMPTS : maxAccountAttempts;
        this.windowDuration = Objects.requireNonNull(windowDuration, "window duration must not be null");
        this.trustForwardedHeader = trustForwardedHeader;
    }

    /** Reserve before expensive work: check + increment are atomic across concurrent callers. */
    public synchronized void reserveLoginAttempt(String email) {
        checkThrottled(email);
        recordFailure(email);
    }

    public synchronized void reservePasswordReset(String email) {
        checkPasswordResetThrottled(email);
        recordPasswordResetDispatch(email);
    }

    public synchronized void reserveSensitiveRequest(SensitiveAction action) {
        String ip = resolveClientIp();
        if (ip == null || ip.isBlank()) return;
        String key = action.name().toLowerCase(Locale.ROOT) + ":ip:" + normalize(ip);
        checkKey(key, action.limit);
        recordKeyFailure(key);
    }

    public enum SensitiveAction {
        REGISTER(20), VERIFY(20), REFRESH(30), OAUTH(30), RESET_CONFIRM(20), PASSWORD_CHANGE(20), LOGOUT(30);
        private final int limit;
        SensitiveAction(int limit) { this.limit = limit; }
    }

    public void checkThrottled(String key) {
        if (key == null || key.isBlank()) {
            return;
        }
        String ip = resolveClientIp();
        if (ip != null) {
            checkLoginThrottled(ip, key);
        } else {
            checkKey("login:fallback:" + normalize(key), maxAttempts);
        }
    }

    public void checkThrottled(String ip, String email) {
        checkLoginThrottled(ip, email);
    }

    public void checkLoginThrottled(String ip, String email) {
        if (ip != null && !ip.isBlank()) {
            checkKey("login:ip:" + normalize(ip), maxIpAttempts);
        }
        if (email != null && !email.isBlank()) {
            checkKey("login:account:" + normalize(email), maxAccountAttempts);
        }
        if (ip != null && !ip.isBlank() && email != null && !email.isBlank()) {
            checkKey("login:pair:" + normalize(ip) + ":" + normalize(email), maxAttempts);
        }
    }

    public void recordFailure(String key) {
        if (key == null || key.isBlank()) {
            return;
        }
        String ip = resolveClientIp();
        if (ip != null) {
            recordLoginFailure(ip, key);
        } else {
            recordKeyFailure("login:fallback:" + normalize(key));
        }
    }

    public void recordFailure(String ip, String email) {
        recordLoginFailure(ip, email);
    }

    public void recordLoginFailure(String ip, String email) {
        if (ip != null && !ip.isBlank()) {
            recordKeyFailure("login:ip:" + normalize(ip));
        }
        if (email != null && !email.isBlank()) {
            recordKeyFailure("login:account:" + normalize(email));
        }
        if (ip != null && !ip.isBlank() && email != null && !email.isBlank()) {
            recordKeyFailure("login:pair:" + normalize(ip) + ":" + normalize(email));
        }
    }

    public void recordSuccess(String key) {
        if (key == null || key.isBlank()) {
            return;
        }
        String ip = resolveClientIp();
        recordLoginSuccess(ip, key);
    }

    public void recordSuccess(String ip, String email) {
        recordLoginSuccess(ip, email);
    }

    public void recordLoginSuccess(String ip, String email) {
        if (email != null && !email.isBlank()) {
            attempts.remove("login:account:" + normalize(email));
            if (ip != null && !ip.isBlank()) {
                attempts.remove("login:pair:" + normalize(ip) + ":" + normalize(email));
            }
        }
    }

    // Password reset dispatch rate limiting
    public void checkPasswordResetThrottled(String email) {
        String ip = resolveClientIp();
        if (ip != null && !ip.isBlank()) {
            checkKey("reset:ip:" + normalize(ip), DEFAULT_RESET_IP_MAX_ATTEMPTS);
        }
        if (email != null && !email.isBlank()) {
            checkKey("reset:email:" + normalize(email), DEFAULT_RESET_EMAIL_MAX_ATTEMPTS);
        }
    }

    public void recordPasswordResetDispatch(String email) {
        String ip = resolveClientIp();
        if (ip != null && !ip.isBlank()) {
            recordKeyFailure("reset:ip:" + normalize(ip));
        }
        if (email != null && !email.isBlank()) {
            recordKeyFailure("reset:email:" + normalize(email));
        }
    }

    // Email verification rate limiting
    public void checkEmailVerificationThrottled() {
        String ip = resolveClientIp();
        if (ip != null && !ip.isBlank()) {
            checkKey("verify:ip:" + normalize(ip), DEFAULT_VERIFY_IP_MAX_ATTEMPTS);
        }
    }

    public void recordEmailVerificationFailure() {
        String ip = resolveClientIp();
        if (ip != null && !ip.isBlank()) {
            recordKeyFailure("verify:ip:" + normalize(ip));
        }
    }

    // Registration rate limiting
    public void checkRegistrationThrottled() {
        String ip = resolveClientIp();
        if (ip != null && !ip.isBlank()) {
            checkKey("register:ip:" + normalize(ip), DEFAULT_REGISTER_IP_MAX_ATTEMPTS);
        }
    }

    public void recordRegistrationDispatch() {
        String ip = resolveClientIp();
        if (ip != null && !ip.isBlank()) {
            recordKeyFailure("register:ip:" + normalize(ip));
        }
    }

    // Token refresh rate limiting
    public void checkRefreshThrottled() {
        String ip = resolveClientIp();
        if (ip != null && !ip.isBlank()) {
            checkKey("refresh:ip:" + normalize(ip), DEFAULT_REFRESH_IP_MAX_ATTEMPTS);
        }
    }

    public void recordRefreshFailure() {
        String ip = resolveClientIp();
        if (ip != null && !ip.isBlank()) {
            recordKeyFailure("refresh:ip:" + normalize(ip));
        }
    }

    // OAuth code exchange rate limiting
    public void checkOAuthExchangeThrottled() {
        String ip = resolveClientIp();
        if (ip != null && !ip.isBlank()) {
            checkKey("oauth:ip:" + normalize(ip), DEFAULT_OAUTH_IP_MAX_ATTEMPTS);
        }
    }

    public void recordOAuthExchangeFailure() {
        String ip = resolveClientIp();
        if (ip != null && !ip.isBlank()) {
            recordKeyFailure("oauth:ip:" + normalize(ip));
        }
    }

    public int size() {
        return attempts.size();
    }

    public void resetAll() {
        attempts.clear();
    }

    public String resolveClientIp() {
        RequestAttributes attrs = RequestContextHolder.getRequestAttributes();
        if (attrs instanceof ServletRequestAttributes servletAttrs) {
            HttpServletRequest request = servletAttrs.getRequest();
            if (trustForwardedHeader) {
                String forwarded = request.getHeader("X-Forwarded-For");
                if (forwarded != null && !forwarded.isBlank()) {
                    return forwarded.split(",")[0].strip();
                }
            }
            return request.getRemoteAddr();
        }
        return null;
    }

    private void checkKey(String normalizedKey, int threshold) {
        Instant now = clock.instant();
        AttemptRecord record = attempts.get(normalizedKey);
        if (record != null && !record.isExpired(now, windowDuration) && record.count() >= threshold) {
            long remainingSeconds = Math.max(1L, Duration.between(now, record.firstAttemptAt().plus(windowDuration)).toSeconds());
            throw new AuthenticationThrottledException(remainingSeconds);
        }
    }

    private synchronized void recordKeyFailure(String normalizedKey) {
        ensureCapacity(normalizedKey);
        Instant now = clock.instant();
        attempts.compute(normalizedKey, (k, existing) -> {
            if (existing == null || existing.isExpired(now, windowDuration)) {
                return new AttemptRecord(1, now);
            }
            return new AttemptRecord(existing.count() + 1, existing.firstAttemptAt());
        });
    }

    private void ensureCapacity(String key) {
        if (attempts.containsKey(key) || attempts.size() < MAX_ENTRIES) return;
        Instant now = clock.instant();
        attempts.entrySet().removeIf(entry -> entry.getValue().isExpired(now, windowDuration));
        // Keep active lockouts. Evicting them would let high-cardinality traffic bypass limits.
        if (attempts.size() >= MAX_ENTRIES) throw new AuthenticationThrottledException(windowDuration.toSeconds());
    }

    private static String normalize(String str) {
        return com.recruitment.app.common.security.TokenDigest.sha256Hex(str == null ? "" : str.strip().toLowerCase(Locale.ROOT));
    }

    private record AttemptRecord(int count, Instant firstAttemptAt) {
        boolean isExpired(Instant now, Duration window) {
            return !now.isBefore(firstAttemptAt.plus(window));
        }
    }
}
