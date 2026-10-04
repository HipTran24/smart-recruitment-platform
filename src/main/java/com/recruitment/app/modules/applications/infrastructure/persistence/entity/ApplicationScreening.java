package com.recruitment.app.modules.applications.infrastructure.persistence.entity;

import com.recruitment.app.common.infrastructure.persistence.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Objects;
import java.util.regex.Pattern;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "application_screenings",
        indexes = @Index(name = "idx_application_screenings_application_status", columnList = "job_application_id, status"),
        uniqueConstraints = @UniqueConstraint(
                name = "uk_application_screenings_application_attempt",
                columnNames = {"job_application_id", "attempt"}
        )
)
public class ApplicationScreening extends BaseEntity {

    private static final Pattern SHA256_HEX_PATTERN = Pattern.compile("^[a-fA-F0-9]{64}$");
    private static final Pattern FAILURE_CODE_PATTERN = Pattern.compile("^[A-Z][A-Z0-9_]{1,63}$");
    private static final Pattern LEASE_TOKEN_PATTERN = Pattern.compile("^[A-Za-z0-9_-]{22,64}$");

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "job_application_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_application_screenings_application")
    )
    private JobApplication jobApplication;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ScreeningStatus status = ScreeningStatus.PENDING;

    @Column
    private Integer score;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private Recommendation recommendation;

    @Column(columnDefinition = "TEXT")
    private String summary;

    // JSON text keeps the entity independent of a specific AI provider's response schema.
    @Column(name = "matched_criteria", columnDefinition = "MEDIUMTEXT")
    private String matchedCriteria;

    @Column(name = "missing_criteria", columnDefinition = "MEDIUMTEXT")
    private String missingCriteria;

    @Column(columnDefinition = "MEDIUMTEXT")
    private String limitations;

    @Column(nullable = false, length = 100)
    private String provider;

    @Column(name = "model_version", nullable = false, length = 100)
    private String modelVersion;

    @Column(name = "prompt_version", nullable = false, length = 100)
    private String promptVersion;

    @Column(name = "input_hash", nullable = false, length = 64)
    private String inputHash;

    @Column(nullable = false)
    private Integer attempt;

    @Column(name = "evaluated_at")
    private Instant evaluatedAt;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "failure_code", length = 64)
    private String failureCode;

    @Column(name = "retryable")
    private Boolean retryable;

    /**
     * An opaque, short-lived lease. It prevents a worker that timed out or was superseded from
     * applying a stale provider response after another worker has reclaimed the screening.
     */
    @Column(name = "processing_lease_token", length = 64)
    private String processingLeaseToken;

    @Column(name = "processing_lease_expires_at")
    private Instant processingLeaseExpiresAt;

    public ApplicationScreening(
            JobApplication jobApplication,
            String provider,
            String modelVersion,
            String promptVersion,
            String inputHash,
            Integer attempt
    ) {
        if (jobApplication == null || attempt == null || attempt < 1) {
            throw new IllegalArgumentException("screening job application and attempt are required");
        }
        this.jobApplication = jobApplication;
        this.provider = requireText(provider, "screening provider");
        this.modelVersion = requireText(modelVersion, "model version");
        this.promptVersion = requireText(promptVersion, "prompt version");
        if (inputHash == null || !SHA256_HEX_PATTERN.matcher(inputHash).matches()) {
            throw new IllegalArgumentException("input hash must be a SHA-256 hash");
        }
        this.inputHash = inputHash.toLowerCase();
        this.attempt = attempt;
    }

    public void markProcessing(String leaseToken, Instant leaseExpiresAt) {
        if (status != ScreeningStatus.PENDING) {
            throw new IllegalStateException("only pending screenings can start");
        }
        assignLease(leaseToken, leaseExpiresAt);
        status = ScreeningStatus.PROCESSING;
        errorMessage = null;
        failureCode = null;
        retryable = null;
    }

    public void reclaimExpiredProcessing(String leaseToken, Instant leaseExpiresAt, Instant now) {
        if (!isLeaseExpired(now)) {
            throw new IllegalStateException("only an expired screening lease can be reclaimed");
        }
        assignLease(leaseToken, leaseExpiresAt);
    }

    public boolean hasActiveLease(String leaseToken, Instant now) {
        return status == ScreeningStatus.PROCESSING
                && Objects.equals(processingLeaseToken, leaseToken)
                && processingLeaseExpiresAt != null
                && processingLeaseExpiresAt.isAfter(requireTime(now));
    }

    public boolean isLeaseExpired(Instant now) {
        return status == ScreeningStatus.PROCESSING
                && (processingLeaseExpiresAt == null || !processingLeaseExpiresAt.isAfter(requireTime(now)));
    }

    /**
     * Applies the normalized provider output after the worker has re-acquired a pessimistic lock.
     * The provider metadata records the model actually used, rather than only the model requested
     * when the screening was queued.
     */
    public void complete(
            Integer score,
            Recommendation recommendation,
            String summary,
            String matchedCriteria,
            String missingCriteria,
            String limitations,
            String provider,
            String modelVersion,
            String promptVersion,
            Instant evaluatedAt
    ) {
        if (status != ScreeningStatus.PROCESSING || score == null || score < 0 || score > 100
                || recommendation == null || evaluatedAt == null) {
            throw new IllegalStateException("screening completion is invalid");
        }
        this.status = ScreeningStatus.COMPLETED;
        this.score = score;
        this.recommendation = recommendation;
        this.summary = summary;
        this.matchedCriteria = matchedCriteria;
        this.missingCriteria = missingCriteria;
        this.limitations = limitations;
        this.provider = requireText(provider, "screening provider");
        this.modelVersion = requireText(modelVersion, "model version");
        this.promptVersion = requireText(promptVersion, "prompt version");
        this.evaluatedAt = evaluatedAt;
        this.errorMessage = null;
        this.failureCode = null;
        this.retryable = null;
        clearLease();
    }

    public void fail(String failureCode, boolean retryable, String errorMessage, Instant evaluatedAt) {
        if (status != ScreeningStatus.PROCESSING || errorMessage == null || errorMessage.isBlank()
                || evaluatedAt == null) {
            throw new IllegalStateException("screening failure is invalid");
        }
        status = ScreeningStatus.FAILED;
        this.failureCode = requireFailureCode(failureCode);
        this.retryable = retryable;
        this.errorMessage = requireBoundedText(errorMessage, "screening failure", 1_000);
        this.evaluatedAt = evaluatedAt;
        clearLease();
    }

    /**
     * Rejects a pending record before any resume content can leave the service. This is used when
     * the request fingerprint does not match the audit fingerprint stored at enqueue time.
     */
    public void rejectPendingInput(String failureCode, String errorMessage, Instant evaluatedAt) {
        if (status != ScreeningStatus.PENDING || evaluatedAt == null) {
            throw new IllegalStateException("only a pending screening can be rejected");
        }
        status = ScreeningStatus.FAILED;
        this.failureCode = requireFailureCode(failureCode);
        this.retryable = false;
        this.errorMessage = requireBoundedText(errorMessage, "screening failure", 1_000);
        this.evaluatedAt = evaluatedAt;
        clearLease();
    }

    private static String requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " must not be blank");
        }
        return value.strip();
    }

    private static String requireBoundedText(String value, String field, int maximumLength) {
        String normalized = requireText(value, field);
        if (normalized.length() > maximumLength) {
            throw new IllegalArgumentException(field + " exceeds the allowed length");
        }
        return normalized;
    }

    private static String requireFailureCode(String value) {
        if (value == null || !FAILURE_CODE_PATTERN.matcher(value).matches()) {
            throw new IllegalArgumentException("screening failure code is invalid");
        }
        return value;
    }

    private static String requireLeaseToken(String value) {
        if (value == null || !LEASE_TOKEN_PATTERN.matcher(value).matches()) {
            throw new IllegalArgumentException("screening processing lease token is invalid");
        }
        return value;
    }

    private static Instant requireFutureTime(Instant value) {
        Instant time = requireTime(value);
        if (!time.isAfter(Instant.EPOCH)) {
            throw new IllegalArgumentException("screening processing lease expiry is invalid");
        }
        return time;
    }

    private static Instant requireTime(Instant value) {
        if (value == null) {
            throw new IllegalArgumentException("time must not be null");
        }
        return value;
    }

    private void clearLease() {
        processingLeaseToken = null;
        processingLeaseExpiresAt = null;
    }

    private void assignLease(String leaseToken, Instant leaseExpiresAt) {
        processingLeaseToken = requireLeaseToken(leaseToken);
        processingLeaseExpiresAt = requireFutureTime(leaseExpiresAt);
    }

    public enum ScreeningStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED
    }

    public enum Recommendation {
        RECOMMENDED,
        REVIEW,
        NOT_RECOMMENDED
    }
}
