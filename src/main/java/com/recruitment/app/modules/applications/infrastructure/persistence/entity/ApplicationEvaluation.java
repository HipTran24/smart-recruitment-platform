package com.recruitment.app.modules.applications.infrastructure.persistence.entity;

import com.recruitment.app.common.infrastructure.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "application_evaluations",
        indexes = @Index(name = "idx_application_evaluations_application", columnList = "job_application_id")
)
public class ApplicationEvaluation extends BaseEntity {

    @Column(name = "job_application_id", nullable = false)
    private Long jobApplicationId;

    @Column(name = "evaluator_user_id", nullable = false)
    private Long evaluatorUserId;

    @Column(nullable = false)
    private Integer score;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Recommendation recommendation;

    @Column(name = "technical_notes", columnDefinition = "TEXT")
    private String technicalNotes;

    @Column(name = "cultural_fit_notes", columnDefinition = "TEXT")
    private String culturalFitNotes;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(name = "areas_for_growth", columnDefinition = "TEXT")
    private String areasForGrowth;

    public ApplicationEvaluation(
            Long jobApplicationId,
            Long evaluatorUserId,
            Integer score,
            Recommendation recommendation,
            String technicalNotes,
            String culturalFitNotes,
            String strengths,
            String areasForGrowth
    ) {
        this.jobApplicationId = jobApplicationId;
        this.evaluatorUserId = evaluatorUserId;
        this.score = Math.max(0, Math.min(100, score != null ? score : 0));
        this.recommendation = recommendation != null ? recommendation : Recommendation.NEUTRAL;
        this.technicalNotes = technicalNotes;
        this.culturalFitNotes = culturalFitNotes;
        this.strengths = strengths;
        this.areasForGrowth = areasForGrowth;
    }

    public enum Recommendation {
        STRONG_YES,
        YES,
        NEUTRAL,
        NO,
        STRONG_NO
    }
}
