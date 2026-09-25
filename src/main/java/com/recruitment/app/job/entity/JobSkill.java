package com.recruitment.app.job.entity;

import com.recruitment.app.common.persistence.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
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
        name = "job_skills",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_job_skills_job_skill",
                columnNames = {"job_id", "skill_id"}
        )
)
public class JobSkill extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "job_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_job_skills_job")
    )
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "skill_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_job_skills_skill")
    )
    private Skill skill;

    @Column(name = "is_required", nullable = false)
    private boolean required = true;

    @Column(name = "minimum_years")
    private Integer minimumYears;

    public JobSkill(Job job, Skill skill, boolean required, Integer minimumYears) {
        this.job = job;
        this.skill = skill;
        this.required = required;
        this.minimumYears = minimumYears;
    }

    public void updateRequirement(boolean required, Integer minimumYears) {
        this.required = required;
        this.minimumYears = minimumYears;
    }
}
