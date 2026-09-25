package com.recruitment.app.job.entity;

import com.recruitment.app.common.persistence.BaseEntity;
import com.recruitment.app.company.entity.Company;
import com.recruitment.app.company.entity.CompanyMember;
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

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "jobs",
        indexes = @Index(
                name = "idx_jobs_company_status_expires_at",
                columnList = "company_id, status, expires_at"
        ),
        uniqueConstraints = @UniqueConstraint(name = "uk_jobs_slug", columnNames = "slug")
)
public class Job extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "company_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_jobs_company")
    )
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "created_by_member_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_jobs_created_by_member")
    )
    private CompanyMember createdBy;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 200)
    private String slug;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", nullable = false, length = 30)
    private EmploymentType employmentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "workplace_type", nullable = false, length = 20)
    private WorkplaceType workplaceType;

    @Column(length = 150)
    private String location;

    @Column(name = "salary_min", precision = 15, scale = 2)
    private BigDecimal salaryMin;

    @Column(name = "salary_max", precision = 15, scale = 2)
    private BigDecimal salaryMax;

    @Column(name = "salary_currency", nullable = false, length = 3)
    private String salaryCurrency = "VND";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private JobStatus status = JobStatus.DRAFT;

    @Column(nullable = false)
    private Integer headcount = 1;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    public Job(
            Company company,
            CompanyMember createdBy,
            String title,
            String slug,
            String description,
            EmploymentType employmentType,
            WorkplaceType workplaceType
    ) {
        this.company = company;
        this.createdBy = createdBy;
        this.title = title;
        this.slug = slug;
        this.description = description;
        this.employmentType = employmentType;
        this.workplaceType = workplaceType;
    }

    public void updateDraft(
            String title,
            String description,
            String requirements,
            EmploymentType employmentType,
            WorkplaceType workplaceType,
            String location,
            BigDecimal salaryMin,
            BigDecimal salaryMax,
            String salaryCurrency,
            Integer headcount,
            Instant expiresAt
    ) {
        this.title = title;
        this.description = description;
        this.requirements = requirements;
        this.employmentType = employmentType;
        this.workplaceType = workplaceType;
        this.location = location;
        this.salaryMin = salaryMin;
        this.salaryMax = salaryMax;
        this.salaryCurrency = salaryCurrency;
        this.headcount = headcount;
        this.expiresAt = expiresAt;
    }

    public void publish(Instant now) {
        status = JobStatus.OPEN;
        publishedAt = now;
    }

    public void close() {
        status = JobStatus.CLOSED;
    }

    public enum EmploymentType {
        FULL_TIME,
        PART_TIME,
        CONTRACT,
        INTERNSHIP,
        FREELANCE
    }

    public enum WorkplaceType {
        ONSITE,
        HYBRID,
        REMOTE
    }

    public enum JobStatus {
        DRAFT,
        OPEN,
        CLOSED
    }
}
