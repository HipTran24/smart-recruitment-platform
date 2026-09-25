package com.recruitment.app.application.entity;

import com.recruitment.app.candidate.entity.CandidateProfile;
import com.recruitment.app.candidate.entity.CandidateResume;
import com.recruitment.app.common.persistence.BaseEntity;
import com.recruitment.app.job.entity.Job;
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
        name = "job_applications",
        indexes = @Index(name = "idx_job_applications_job_status", columnList = "job_id, status"),
        uniqueConstraints = @UniqueConstraint(
                name = "uk_job_applications_job_candidate",
                columnNames = {"job_id", "candidate_profile_id"}
        )
)
public class JobApplication extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "job_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_job_applications_job")
    )
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "candidate_profile_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_job_applications_candidate_profile")
    )
    private CandidateProfile candidateProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "candidate_resume_id",
            foreignKey = @ForeignKey(name = "fk_job_applications_candidate_resume")
    )
    private CandidateResume candidateResume;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStatus status = ApplicationStatus.SUBMITTED;

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Column(name = "withdrawn_at")
    private Instant withdrawnAt;

    public JobApplication(
            Job job,
            CandidateProfile candidateProfile,
            CandidateResume candidateResume,
            String coverLetter
    ) {
        this.job = job;
        this.candidateProfile = candidateProfile;
        this.candidateResume = candidateResume;
        this.coverLetter = coverLetter;
    }

    public void changeStatus(ApplicationStatus status) {
        this.status = status;
    }

    public void withdraw(Instant now) {
        status = ApplicationStatus.WITHDRAWN;
        withdrawnAt = now;
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
