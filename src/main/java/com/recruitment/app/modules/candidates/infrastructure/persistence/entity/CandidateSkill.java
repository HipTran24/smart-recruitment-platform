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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "candidate_profile_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_candidate_skills_profile")
    )
    private CandidateProfile candidateProfile;

    @Column(name = "skill_id", nullable = false)
    private Long skillId;

    @Enumerated(EnumType.STRING)
    @Column(name = "proficiency_level", nullable = false, length = 20)
    private ProficiencyLevel proficiencyLevel;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    public CandidateSkill(
            CandidateProfile candidateProfile,
            Long skillId,
            ProficiencyLevel proficiencyLevel,
            Integer yearsOfExperience
    ) {
        if (candidateProfile == null) {
            throw new IllegalArgumentException("candidate profile must not be null");
        }
        if (skillId == null || skillId <= 0) {
            throw new IllegalArgumentException("skill id must be positive");
        }
        if (yearsOfExperience != null && yearsOfExperience < 0) {
            throw new IllegalArgumentException("years of experience must not be negative");
        }
        this.skillId = skillId;
        this.proficiencyLevel = requireProficiency(proficiencyLevel);
        this.yearsOfExperience = yearsOfExperience;
        candidateProfile.addSkill(this);
    }

    public void updateProficiency(ProficiencyLevel proficiencyLevel, Integer yearsOfExperience) {
        if (yearsOfExperience != null && yearsOfExperience < 0) {
            throw new IllegalArgumentException("candidate skill proficiency is invalid");
        }
        this.proficiencyLevel = requireProficiency(proficiencyLevel);
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

    private static ProficiencyLevel requireProficiency(ProficiencyLevel value) {
        if (value == null) {
            throw new IllegalArgumentException("proficiency level must not be null");
        }
        return value;
    }

    public enum ProficiencyLevel {
        BEGINNER,
        INTERMEDIATE,
        ADVANCED,
        EXPERT
    }
}
