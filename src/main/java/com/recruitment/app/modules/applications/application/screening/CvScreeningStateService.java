package com.recruitment.app.modules.applications.application.screening;

import com.recruitment.app.modules.applications.infrastructure.persistence.entity.ApplicationScreening;
import com.recruitment.app.modules.applications.infrastructure.persistence.entity.JobApplication;
import com.recruitment.app.modules.applications.infrastructure.persistence.repository.ApplicationScreeningRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Objects;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

/**
 * Owns only short, durable screening-state transitions. Every operation obtains a pessimistic
 * row lock in its own transaction. {@link CvScreeningWorkflow} invokes the external provider only
 * after {@link #claim(Long, String)} has returned and its transaction has committed.
 */
@Service
public class CvScreeningStateService {

    /**
     * The Gemini adapter caps both connection and read timeouts, so five minutes leaves room for
     * network setup while still allowing a stranded worker claim to be recovered. A dispatcher may
     * invoke the same workflow again after this lease expires; no scheduler is required here.
     */
    static final Duration PROCESSING_LEASE_TTL = Duration.ofMinutes(5);

    private final ApplicationScreeningRepository screenings;
    private final ObjectMapper objectMapper;
    private final Clock clock;
    private final SecureRandom secureRandom;

    @Autowired
    public CvScreeningStateService(
            ApplicationScreeningRepository screenings,
            ObjectMapper objectMapper,
            Clock clock
    ) {
        this(screenings, objectMapper, clock, new SecureRandom());
    }

    CvScreeningStateService(
            ApplicationScreeningRepository screenings,
            ObjectMapper objectMapper,
            Clock clock,
            SecureRandom secureRandom
    ) {
        this.screenings = Objects.requireNonNull(screenings, "screening repository must not be null");
        this.objectMapper = Objects.requireNonNull(objectMapper, "object mapper must not be null");
        this.clock = Objects.requireNonNull(clock, "clock must not be null");
        this.secureRandom = Objects.requireNonNull(secureRandom, "secure random must not be null");
    }

    /**
     * Claims a pending screening or safely reclaims an expired worker lease. It never loads or
     * stores raw resume text; only the canonical input fingerprint is compared.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ClaimResult claim(Long screeningId, String inputHash) {
        validateScreeningId(screeningId);
        validateInputHash(inputHash);

        Instant now = clock.instant();
        ApplicationScreening screening = screenings.findByIdForUpdate(screeningId).orElse(null);
        if (screening == null) {
            return ClaimResult.notFound();
        }

        if (!screening.getInputHash().equals(inputHash)) {
            if (screening.getStatus() == ApplicationScreening.ScreeningStatus.PENDING) {
                CvScreeningFailure failure = CvScreeningFailure.inputFingerprintMismatch();
                screening.rejectPendingInput(
                        failure.code(),
                        failure.message(),
                        now
                );
                return ClaimResult.inputRejected();
            }
            return ClaimResult.notClaimable();
        }

        if (!isApplicationEligible(screening)) {
            if (screening.getStatus() == ApplicationScreening.ScreeningStatus.PENDING) {
                CvScreeningFailure failure = CvScreeningFailure.applicationNotEligible();
                screening.rejectPendingInput(failure.code(), failure.message(), now);
                return ClaimResult.applicationRejected();
            }
            return ClaimResult.notClaimable();
        }

        if (screening.getStatus() == ApplicationScreening.ScreeningStatus.PENDING) {
            return ClaimResult.claimed(start(screening, now));
        }
        if (screening.isLeaseExpired(now)) {
            return ClaimResult.claimed(reclaim(screening, now));
        }
        return ClaimResult.notClaimable();
    }

    /**
     * Re-locks the row before persisting normalized, auditable provider output. A stale lease can
     * never complete a screening reclaimed by another worker.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public CompletionResult complete(ScreeningLease lease, CvScreeningResult result) {
        Objects.requireNonNull(lease, "screening lease must not be null");
        Objects.requireNonNull(result, "CV screening result must not be null");

        Instant now = clock.instant();
        ApplicationScreening screening = screenings.findByIdForUpdate(lease.screeningId()).orElse(null);
        if (screening == null || !screening.hasActiveLease(lease.token(), now)) {
            return CompletionResult.notApplied();
        }
        if (!isApplicationEligible(screening)) {
            CvScreeningFailure failure = CvScreeningFailure.applicationNotEligible();
            screening.fail(failure.code(), failure.retryable(), failure.message(), now);
            return CompletionResult.applicationRejected();
        }

        screening.complete(
                result.score(),
                toEntityRecommendation(result.recommendation()),
                result.summary(),
                serializeAuditList(result.matchedCriteria()),
                serializeAuditList(result.missingCriteria()),
                serializeAuditList(result.limitations()),
                result.provider(),
                result.model(),
                result.promptVersion(),
                now
        );
        return CompletionResult.completed();
    }

    /**
     * Persists a sanitized failure only while this worker still owns the live lease. This makes a
     * late error from a timed-out worker harmless after a lease has been reclaimed.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public boolean fail(ScreeningLease lease, CvScreeningFailure failure) {
        Objects.requireNonNull(lease, "screening lease must not be null");
        Objects.requireNonNull(failure, "CV screening failure must not be null");

        Instant now = clock.instant();
        ApplicationScreening screening = screenings.findByIdForUpdate(lease.screeningId()).orElse(null);
        if (screening == null || !screening.hasActiveLease(lease.token(), now)) {
            return false;
        }
        screening.fail(failure.code(), failure.retryable(), failure.message(), now);
        return true;
    }

    private ScreeningLease start(ApplicationScreening screening, Instant now) {
        String token = generateLeaseToken();
        screening.markProcessing(token, now.plus(PROCESSING_LEASE_TTL));
        return new ScreeningLease(screening.getId(), token);
    }

    private ScreeningLease reclaim(ApplicationScreening screening, Instant now) {
        String token = generateLeaseToken();
        screening.reclaimExpiredProcessing(token, now.plus(PROCESSING_LEASE_TTL), now);
        return new ScreeningLease(screening.getId(), token);
    }

    private static boolean isApplicationEligible(ApplicationScreening screening) {
        JobApplication.ApplicationStatus status = screening.getJobApplication().getStatus();
        return status != JobApplication.ApplicationStatus.REJECTED
                && status != JobApplication.ApplicationStatus.WITHDRAWN;
    }

    private String serializeAuditList(List<String> values) {
        try {
            return objectMapper.writeValueAsString(values);
        } catch (JacksonException exception) {
            throw new IllegalStateException("could not serialize CV screening audit data", exception);
        }
    }

    private String generateLeaseToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static ApplicationScreening.Recommendation toEntityRecommendation(
            CvScreeningResult.Recommendation recommendation
    ) {
        return ApplicationScreening.Recommendation.valueOf(recommendation.name());
    }

    private static void validateScreeningId(Long screeningId) {
        if (screeningId == null || screeningId <= 0) {
            throw new IllegalArgumentException("screening id must be positive");
        }
    }

    private static void validateInputHash(String inputHash) {
        if (inputHash == null || !inputHash.matches("[a-fA-F0-9]{64}")) {
            throw new IllegalArgumentException("screening input hash must be a SHA-256 hash");
        }
    }

    public record ScreeningLease(Long screeningId, String token) {

        public ScreeningLease {
            validateScreeningId(screeningId);
            if (token == null || !token.matches("[A-Za-z0-9_-]{22,64}")) {
                throw new IllegalArgumentException("screening lease token is invalid");
            }
        }
    }

    public record ClaimResult(ClaimStatus status, ScreeningLease lease) {

        public ClaimResult {
            status = Objects.requireNonNull(status, "screening claim status must not be null");
            if (status == ClaimStatus.CLAIMED && lease == null) {
                throw new IllegalArgumentException("a claimed screening requires a lease");
            }
            if (status != ClaimStatus.CLAIMED && lease != null) {
                throw new IllegalArgumentException("only a claimed screening can carry a lease");
            }
        }

        static ClaimResult claimed(ScreeningLease lease) {
            return new ClaimResult(ClaimStatus.CLAIMED, lease);
        }

        static ClaimResult notFound() {
            return new ClaimResult(ClaimStatus.NOT_FOUND, null);
        }

        static ClaimResult notClaimable() {
            return new ClaimResult(ClaimStatus.NOT_CLAIMABLE, null);
        }

        static ClaimResult inputRejected() {
            return new ClaimResult(ClaimStatus.INPUT_REJECTED, null);
        }

        static ClaimResult applicationRejected() {
            return new ClaimResult(ClaimStatus.APPLICATION_REJECTED, null);
        }
    }

    public enum ClaimStatus {
        CLAIMED,
        NOT_FOUND,
        NOT_CLAIMABLE,
        INPUT_REJECTED,
        APPLICATION_REJECTED
    }

    public record CompletionResult(CompletionStatus status) {

        public CompletionResult {
            status = Objects.requireNonNull(status, "screening completion status must not be null");
        }

        static CompletionResult completed() {
            return new CompletionResult(CompletionStatus.COMPLETED);
        }

        static CompletionResult notApplied() {
            return new CompletionResult(CompletionStatus.NOT_APPLIED);
        }

        static CompletionResult applicationRejected() {
            return new CompletionResult(CompletionStatus.APPLICATION_REJECTED);
        }
    }

    public enum CompletionStatus {
        COMPLETED,
        NOT_APPLIED,
        APPLICATION_REJECTED
    }
}
