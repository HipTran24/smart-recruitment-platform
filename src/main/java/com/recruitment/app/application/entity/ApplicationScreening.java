package com.recruitment.app.application.entity;

import com.recruitment.app.common.persistence.BaseEntity;
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
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "application_screenings",
        indexes = @Index(name = "idx_application_screenings_application_status", columnList = "job_application_id, status")
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

    @Column(name = "model_version", length = 100)
    private String modelVersion;

    @Column(name = "evaluated_at")
    private Instant evaluatedAt;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    public ApplicationScreening(JobApplication jobApplication, String modelVersion) {
        this.jobApplication = jobApplication;
        this.modelVersion = modelVersion;
    }

    public void markProcessing() {
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
        status = ScreeningStatus.FAILED;
        this.errorMessage = errorMessage;
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
