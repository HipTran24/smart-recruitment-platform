package com.recruitment.app.modules.applications.application.screening;

import com.recruitment.app.modules.applications.application.screening.port.out.ApplicationScreeningStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Objects;

/**
 * Owns only short, durable screening-state transitions. Every operation executes
 * through the screening persistence port. {@link CvScreeningWorkflow} invokes the external provider only
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

    private final ApplicationScreeningStore screeningStore;

    @Autowired
    public CvScreeningStateService(ApplicationScreeningStore screeningStore) {
        this.screeningStore = Objects.requireNonNull(screeningStore, "screening store must not be null");
    }

    /**
     * Claims a pending screening or safely reclaims an expired worker lease. It never loads or
     * stores raw resume text; only the canonical input fingerprint is compared.
     */
    public ClaimResult claim(Long screeningId, String inputHash) {
        validateScreeningId(screeningId);
        validateInputHash(inputHash);
        return screeningStore.claim(screeningId, inputHash, PROCESSING_LEASE_TTL);
    }

    /**
     * Re-locks the row before persisting normalized, auditable provider output. A stale lease can
     * never complete a screening reclaimed by another worker.
     */
    public CompletionResult complete(ScreeningLease lease, CvScreeningResult result) {
        Objects.requireNonNull(lease, "screening lease must not be null");
        Objects.requireNonNull(result, "CV screening result must not be null");
        return screeningStore.complete(lease, result);
    }

    /**
     * Persists a sanitized failure only while this worker still owns the live lease. This makes a
     * late error from a timed-out worker harmless after a lease has been reclaimed.
     */
    public boolean fail(ScreeningLease lease, CvScreeningFailure failure) {
        Objects.requireNonNull(lease, "screening lease must not be null");
        Objects.requireNonNull(failure, "CV screening failure must not be null");
        return screeningStore.fail(lease, failure);
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

        public static ClaimResult claimed(ScreeningLease lease) {
            return new ClaimResult(ClaimStatus.CLAIMED, lease);
        }

        public static ClaimResult notFound() {
            return new ClaimResult(ClaimStatus.NOT_FOUND, null);
        }

        public static ClaimResult notClaimable() {
            return new ClaimResult(ClaimStatus.NOT_CLAIMABLE, null);
        }

        public static ClaimResult inputRejected() {
            return new ClaimResult(ClaimStatus.INPUT_REJECTED, null);
        }

        public static ClaimResult applicationRejected() {
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

        public static CompletionResult completed() {
            return new CompletionResult(CompletionStatus.COMPLETED);
        }

        public static CompletionResult notApplied() {
            return new CompletionResult(CompletionStatus.NOT_APPLIED);
        }

        public static CompletionResult applicationRejected() {
            return new CompletionResult(CompletionStatus.APPLICATION_REJECTED);
        }
    }

    public enum CompletionStatus {
        COMPLETED,
        NOT_APPLIED,
        APPLICATION_REJECTED
    }
}
