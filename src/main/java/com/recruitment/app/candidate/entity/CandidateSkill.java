package com.recruitment.app.candidate.entity;

import com.recruitment.app.common.persistence.BaseEntity;
import com.recruitment.app.job.entity.Skill;
import com.fasterxml.jackson.annotation.JsonIgnore;
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

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "candidate_skills",
        indexes = @Index(name = "idx_candidate_skills_profile_id", columnList = "candidate_profile_id"),
        uniqueConstraints = @UniqueConstraint(
                name = "uk_candidate_skills_profile_skill",
                columnNames = {"candidate_profile_id", "skill_id"}
        )
)
public class CandidateSkill extends BaseEntity {

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "candidate_profile_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_candidate_skills_profile")
    )
    private CandidateProfile candidateProfile;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "skill_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_candidate_skills_skill")
    )
    private Skill skill;

    @Enumerated(EnumType.STRING)
    @Column(name = "proficiency_level", nullable = false, length = 20)
    private ProficiencyLevel proficiencyLevel;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    public CandidateSkill(
            CandidateProfile candidateProfile,
            Skill skill,
            ProficiencyLevel proficiencyLevel,
            Integer yearsOfExperience
    ) {
        this.skill = skill;
        this.proficiencyLevel = proficiencyLevel;
        this.yearsOfExperience = yearsOfExperience;
        candidateProfile.addSkill(this);
    }

    public void updateProficiency(ProficiencyLevel proficiencyLevel, Integer yearsOfExperience) {
        this.proficiencyLevel = proficiencyLevel;
        this.yearsOfExperience = yearsOfExperience;
    }

    void attachTo(CandidateProfile candidateProfile) {
        if (this.candidateProfile != null && this.candidateProfile != candidateProfile) {
            throw new IllegalStateException("candidate skill cannot be moved to another candidate profile");
        }
        this.candidateProfile = candidateProfile;
    }

    void detachFrom(CandidateProfile candidateProfile) {
        if (this.candidateProfile != candidateProfile) {
            throw new IllegalArgumentException("candidate skill does not belong to this candidate profile");
        }
        this.candidateProfile = null;
    }

    public enum ProficiencyLevel {
        BEGINNER,
        INTERMEDIATE,
        ADVANCED,
        EXPERT
    }
}
