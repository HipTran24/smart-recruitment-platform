package com.recruitment.app.modules.jobs.infrastructure.persistence.entity;

import com.recruitment.app.common.infrastructure.persistence.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Locale;

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

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "created_by_user_id", nullable = false)
    private Long createdByUserId;

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

    @Column(name = "closed_at")
    private Instant closedAt;

    public Job(
            Long companyId,
            Long createdByUserId,
            String title,
            String slug,
            String description,
            EmploymentType employmentType,
            WorkplaceType workplaceType
    ) {
        this.companyId = requireId(companyId, "company id");
        this.createdByUserId = requireId(createdByUserId, "created by user id");
        this.title = requireText(title, "job title");
        this.slug = normalizeSlug(slug);
        this.description = requireText(description, "job description");
        this.employmentType = requireNonNull(employmentType, "employment type");
        this.workplaceType = requireNonNull(workplaceType, "workplace type");
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
        requireDraft();
        validateCompensation(salaryMin, salaryMax, salaryCurrency, headcount);
        this.title = requireText(title, "job title");
        this.description = requireText(description, "job description");
        this.requirements = requirements;
        this.employmentType = requireNonNull(employmentType, "employment type");
        this.workplaceType = requireNonNull(workplaceType, "workplace type");
        this.location = location;
        this.salaryMin = salaryMin;
        this.salaryMax = salaryMax;
        this.salaryCurrency = salaryCurrency;
        this.headcount = headcount;
        this.expiresAt = expiresAt;
    }

    public void publish(Instant now) {
        requireDraft();
        Instant publishTime = requireTime(now);
        if (expiresAt != null && !expiresAt.isAfter(publishTime)) {
            throw new IllegalStateException("job expiry must be after publication");
        }
        status = JobStatus.OPEN;
        publishedAt = publishTime;
    }

    public void close(Instant now) {
        if (status != JobStatus.OPEN) {
            throw new IllegalStateException("only open jobs can be closed");
        }
        status = JobStatus.CLOSED;
        closedAt = requireTime(now);
    }

    public void expire(Instant now) {
        Instant expirationTime = requireTime(now);
        if (status != JobStatus.OPEN || expiresAt == null || expiresAt.isAfter(expirationTime)) {
            throw new IllegalStateException("job is not ready to expire");
        }
        status = JobStatus.EXPIRED;
        closedAt = expirationTime;
    }

    public boolean isAcceptingApplications(Instant now) {
        return status == JobStatus.OPEN && (expiresAt == null || expiresAt.isAfter(requireTime(now)));
    }

    public void changeSlug(String slug) {
        requireDraft();
        this.slug = normalizeSlug(slug);
    }

    private void requireDraft() {
        if (status != JobStatus.DRAFT) {
            throw new IllegalStateException("only draft jobs can be edited or published");
        }
    }

    private static void validateCompensation(
            BigDecimal salaryMin,
            BigDecimal salaryMax,
            String salaryCurrency,
            Integer headcount
    ) {
        if (salaryMin != null && salaryMin.signum() < 0
                || salaryMax != null && salaryMax.signum() < 0
                || salaryMin != null && salaryMax != null && salaryMin.compareTo(salaryMax) > 0) {
            throw new IllegalArgumentException("salary range is invalid");
        }
        if (salaryCurrency == null || !salaryCurrency.matches("[A-Z]{3}")) {
            throw new IllegalArgumentException("salary currency must be an ISO 4217 code");
        }
        if (headcount == null || headcount < 1) {
            throw new IllegalArgumentException("headcount must be positive");
        }
    }

    private static Long requireId(Long value, String field) {
        if (value == null || value <= 0) {
            throw new IllegalArgumentException(field + " must be positive");
        }
        return value;
    }

    private static String normalizeSlug(String value) {
        String slug = requireText(value, "job slug").toLowerCase(Locale.ROOT);
        if (!slug.matches("[a-z0-9]+(?:-[a-z0-9]+)*")) {
            throw new IllegalArgumentException("job slug must use lower kebab-case");
        }
        return slug;
    }

    private static String requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " must not be blank");
        }
        return value.strip();
    }

    private static <T> T requireNonNull(T value, String field) {
        if (value == null) {
            throw new IllegalArgumentException(field + " must not be null");
        }
        return value;
    }

    private static Instant requireTime(Instant value) {
        if (value == null) {
            throw new IllegalArgumentException("time must not be null");
        }
        return value;
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
        CLOSED,
        EXPIRED
    }
}
