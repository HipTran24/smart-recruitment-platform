package com.recruitment.app.modules.applications.infrastructure.persistence.entity;

import com.recruitment.app.common.infrastructure.persistence.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "job_applications",
        indexes = @Index(name = "idx_job_applications_job_status", columnList = "job_id, status"),
        uniqueConstraints = @UniqueConstraint(
                name = "uk_job_applications_job_candidate",
                columnNames = {"job_id", "candidate_profile_id"}
        )
)
public class JobApplication extends BaseEntity {

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "candidate_profile_id", nullable = false)
    private Long candidateProfileId;

    @Column(name = "candidate_resume_id")
    private Long candidateResumeId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStatus status = ApplicationStatus.SUBMITTED;

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Column(name = "withdrawn_at")
    private Instant withdrawnAt;

    @OneToMany(
            mappedBy = "jobApplication",
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<ApplicationStatusHistory> statusHistories = new ArrayList<>();

    public JobApplication(
            Long jobId,
            Long candidateProfileId,
            Long candidateResumeId,
            String coverLetter
    ) {
        this.jobId = requireId(jobId, "job id");
        this.candidateProfileId = requireId(candidateProfileId, "candidate profile id");
        if (candidateResumeId != null && candidateResumeId <= 0) {
            throw new IllegalArgumentException("candidate resume id must be positive");
        }
        this.candidateResumeId = candidateResumeId;
        this.coverLetter = coverLetter;
        statusHistories.add(new ApplicationStatusHistory(this, null, status, null, "Application submitted"));
    }

    public void transitionTo(ApplicationStatus targetStatus, Long changedByUserId, String note, Instant now) {
        if (targetStatus == null || targetStatus == status) {
            throw new IllegalArgumentException("application status transition is invalid");
        }
        if (!isAllowedTransition(status, targetStatus)) {
            throw new IllegalStateException("application status transition is not allowed");
        }
        ApplicationStatus previousStatus = status;
        status = targetStatus;
        statusHistories.add(new ApplicationStatusHistory(this, previousStatus, targetStatus, changedByUserId, note));
        if (targetStatus == ApplicationStatus.WITHDRAWN) {
            withdrawnAt = requireTime(now);
        }
    }

    public void withdraw(Long changedByUserId, String note, Instant now) {
        transitionTo(ApplicationStatus.WITHDRAWN, changedByUserId, note, now);
    }

    public List<ApplicationStatusHistory> getStatusHistories() {
        return Collections.unmodifiableList(statusHistories);
    }

    private static boolean isAllowedTransition(ApplicationStatus from, ApplicationStatus to) {
        return switch (from) {
            case SUBMITTED -> to == ApplicationStatus.IN_REVIEW
                    || to == ApplicationStatus.REJECTED
                    || to == ApplicationStatus.WITHDRAWN;
            case IN_REVIEW -> to == ApplicationStatus.SHORTLISTED
                    || to == ApplicationStatus.REJECTED
                    || to == ApplicationStatus.WITHDRAWN;
            case SHORTLISTED -> to == ApplicationStatus.INTERVIEW
                    || to == ApplicationStatus.REJECTED
                    || to == ApplicationStatus.WITHDRAWN;
            case INTERVIEW -> to == ApplicationStatus.OFFERED
                    || to == ApplicationStatus.REJECTED
                    || to == ApplicationStatus.WITHDRAWN;
            case OFFERED -> to == ApplicationStatus.REJECTED || to == ApplicationStatus.WITHDRAWN;
            case REJECTED, WITHDRAWN -> false;
        };
    }

    private static Long requireId(Long value, String field) {
        if (value == null || value <= 0) {
            throw new IllegalArgumentException(field + " must be positive");
        }
        return value;
    }

    private static Instant requireTime(Instant value) {
        if (value == null) {
            throw new IllegalArgumentException("time must not be null");
        }
        return value;
    }

    public enum ApplicationStatus {
        SUBMITTED,
        IN_REVIEW,
        SHORTLISTED,
        INTERVIEW,
        OFFERED,
        REJECTED,
        WITHDRAWN
    }
}
