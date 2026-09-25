package com.recruitment.app.candidate.entity;

import com.recruitment.app.common.persistence.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
        name = "candidate_educations",
        indexes = @Index(name = "idx_candidate_educations_profile_id", columnList = "candidate_profile_id")
)
public class CandidateEducation extends BaseEntity {

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "candidate_profile_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_candidate_educations_profile")
    )
    private CandidateProfile candidateProfile;

    @Column(name = "institution_name", nullable = false, length = 200)
    private String institutionName;

    @Column(length = 120)
    private String degree;

    @Column(name = "field_of_study", length = 150)
    private String fieldOfStudy;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    public CandidateEducation(CandidateProfile candidateProfile, String institutionName) {
        this.institutionName = institutionName;
        candidateProfile.addEducation(this);
    }

    public void updateDetails(
            String institutionName,
            String degree,
            String fieldOfStudy,
            LocalDate startDate,
            LocalDate endDate,
            String description
    ) {
        this.institutionName = institutionName;
        this.degree = degree;
        this.fieldOfStudy = fieldOfStudy;
        this.startDate = startDate;
        this.endDate = endDate;
        this.description = description;
    }

    void attachTo(CandidateProfile candidateProfile) {
        if (this.candidateProfile != null && this.candidateProfile != candidateProfile) {
            throw new IllegalStateException("education cannot be moved to another candidate profile");
        }
        this.candidateProfile = candidateProfile;
    }

    void detachFrom(CandidateProfile candidateProfile) {
        if (this.candidateProfile != candidateProfile) {
            throw new IllegalArgumentException("education does not belong to this candidate profile");
        }
        this.candidateProfile = null;
    }
}
