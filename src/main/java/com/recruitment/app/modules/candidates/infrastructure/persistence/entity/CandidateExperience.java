package com.recruitment.app.modules.candidates.infrastructure.persistence.entity;

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
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "candidate_experiences",
        indexes = @Index(name = "idx_candidate_experiences_profile_id", columnList = "candidate_profile_id")
)
public class CandidateExperience extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "candidate_profile_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_candidate_experiences_profile")
    )
    private CandidateProfile candidateProfile;

    @Column(name = "company_name", nullable = false, length = 200)
    private String companyName;

    @Column(name = "job_title", nullable = false, length = 150)
    private String jobTitle;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", nullable = false, length = 30)
    private EmploymentType employmentType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    public CandidateExperience(
            CandidateProfile candidateProfile,
            String companyName,
            String jobTitle,
            EmploymentType employmentType,
            LocalDate startDate
    ) {
        validateDates(startDate, null);
        this.companyName = requireText(companyName, "company name");
        this.jobTitle = requireText(jobTitle, "job title");
        this.employmentType = requireEmploymentType(employmentType);
        this.startDate = startDate;
        candidateProfile.addExperience(this);
    }

    public void updateDetails(
            String companyName,
            String jobTitle,
            EmploymentType employmentType,
            LocalDate startDate,
            LocalDate endDate,
            String description
    ) {
        validateDates(startDate, endDate);
        this.companyName = requireText(companyName, "company name");
        this.jobTitle = requireText(jobTitle, "job title");
        this.employmentType = requireEmploymentType(employmentType);
        this.startDate = startDate;
        this.endDate = endDate;
        this.description = description;
    }

    private static void validateDates(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || (endDate != null && endDate.isBefore(startDate))) {
            throw new IllegalArgumentException("experience dates are invalid");
        }
    }

    private static EmploymentType requireEmploymentType(EmploymentType value) {
        if (value == null) {
            throw new IllegalArgumentException("employment type must not be null");
        }
        return value;
    }

    private static String requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " must not be blank");
        }
        return value.strip();
    }

    void attachTo(CandidateProfile candidateProfile) {
        if (this.candidateProfile != null && this.candidateProfile != candidateProfile) {
            throw new IllegalStateException("experience cannot be moved to another candidate profile");
        }
        this.candidateProfile = candidateProfile;
    }

    void detachFrom(CandidateProfile candidateProfile) {
        if (this.candidateProfile != candidateProfile) {
            throw new IllegalArgumentException("experience does not belong to this candidate profile");
        }
        this.candidateProfile = null;
    }
}
