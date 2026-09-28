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
    @Column(name = "matched_criteria", columnDefinition = "TEXT")
    private String matchedCriteria;

    @Column(name = "missing_criteria", columnDefinition = "TEXT")
    private String missingCriteria;

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
        if (inputHash == null || !inputHash.matches("[a-fA-F0-9]{64}")) {
            throw new IllegalArgumentException("input hash must be a SHA-256 hash");
        }
        this.inputHash = inputHash.toLowerCase();
        this.attempt = attempt;
    }

    public void markProcessing() {
        if (status != ScreeningStatus.PENDING) {
            throw new IllegalStateException("only pending screenings can start");
        }
        status = ScreeningStatus.PROCESSING;
        errorMessage = null;
    }

    public void complete(
            Integer score,
            Recommendation recommendation,
            String summary,
            String matchedCriteria,
            String missingCriteria,
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
        this.evaluatedAt = evaluatedAt;
        this.errorMessage = null;
    }

    public void fail(String errorMessage) {
        if (status != ScreeningStatus.PROCESSING || errorMessage == null || errorMessage.isBlank()) {
            throw new IllegalStateException("screening failure is invalid");
        }
        status = ScreeningStatus.FAILED;
        this.errorMessage = errorMessage;
    }

    private static String requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " must not be blank");
        }
        return value.strip();
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
