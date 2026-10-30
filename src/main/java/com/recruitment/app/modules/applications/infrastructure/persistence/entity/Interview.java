package com.recruitment.app.modules.applications.infrastructure.persistence.entity;

import com.recruitment.app.common.infrastructure.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "interviews",
        indexes = {
                @Index(name = "idx_interviews_application", columnList = "job_application_id"),
                @Index(name = "idx_interviews_candidate", columnList = "candidate_user_id, scheduled_at"),
                @Index(name = "idx_interviews_recruiter", columnList = "recruiter_user_id, scheduled_at")
        }
)
public class Interview extends BaseEntity {

    @Column(name = "job_application_id", nullable = false)
    private Long jobApplicationId;

    @Column(name = "candidate_user_id", nullable = false)
    private Long candidateUserId;

    @Column(name = "recruiter_user_id", nullable = false)
    private Long recruiterUserId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "scheduled_at", nullable = false)
    private Instant scheduledAt;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes = 45;

    @Column(name = "location_or_url", length = 500)
    private String locationOrUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InterviewStatus status = InterviewStatus.SCHEDULED;

    @Column(nullable = false, length = 50)
    private String timezone = "UTC";

    @Column(columnDefinition = "TEXT")
    private String notes;

    public Interview(
            Long jobApplicationId,
            Long candidateUserId,
            Long recruiterUserId,
            String title,
            Instant scheduledAt,
            Integer durationMinutes,
            String locationOrUrl,
            String timezone,
            String notes
    ) {
        this.jobApplicationId = jobApplicationId;
        this.candidateUserId = candidateUserId;
        this.recruiterUserId = recruiterUserId;
        this.title = title;
        this.scheduledAt = scheduledAt;
        if (durationMinutes != null && durationMinutes > 0) {
            this.durationMinutes = durationMinutes;
        }
        this.locationOrUrl = locationOrUrl;
        if (timezone != null && !timezone.isBlank()) {
            this.timezone = timezone;
        }
        this.notes = notes;
    }

    public void reschedule(Instant newTime, Integer duration, String location, String notes) {
        if (status == InterviewStatus.CANCELLED) {
            throw new IllegalStateException("cannot reschedule cancelled interview");
        }
        this.scheduledAt = newTime;
        if (duration != null && duration > 0) {
            this.durationMinutes = duration;
        }
        this.locationOrUrl = location;
        this.notes = notes;
    }

    public void cancel(String reason) {
        this.status = InterviewStatus.CANCELLED;
        this.notes = (this.notes != null ? this.notes + "\nCancelled: " : "Cancelled: ") + reason;
    }

    public void complete() {
        this.status = InterviewStatus.COMPLETED;
    }

    public enum InterviewStatus {
        SCHEDULED,
        COMPLETED,
        CANCELLED
    }
}
