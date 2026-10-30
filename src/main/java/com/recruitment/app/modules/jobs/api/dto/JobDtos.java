package com.recruitment.app.modules.jobs.api.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class JobDtos {
    private JobDtos() {}

    public record JobSummaryResponse(
            Long id,
            String title,
            String slug,
            String companyName,
            String location,
            String employmentType,
            String workplaceType,
            BigDecimal salaryMin,
            BigDecimal salaryMax,
            String salaryCurrency,
            String status,
            Instant publishedAt,
            Instant expiresAt
    ) {}

    public record JobDetailResponse(
            Long id,
            Long companyId,
            String companyName,
            Long createdByUserId,
            String title,
            String slug,
            String description,
            String requirements,
            String employmentType,
            String workplaceType,
            String location,
            BigDecimal salaryMin,
            BigDecimal salaryMax,
            String salaryCurrency,
            String status,
            Integer headcount,
            Instant publishedAt,
            Instant expiresAt,
            Instant closedAt,
            List<SkillDto> skills
    ) {}

    public record CreateJobRequest(
            Long companyId,
            String title,
            String slug,
            String description,
            String requirements,
            String employmentType,
            String workplaceType,
            String location,
            BigDecimal salaryMin,
            BigDecimal salaryMax,
            String salaryCurrency,
            Integer headcount,
            Instant expiresAt
    ) {}

    public record UpdateJobRequest(
            String title,
            String description,
            String requirements,
            String employmentType,
            String workplaceType,
            String location,
            BigDecimal salaryMin,
            BigDecimal salaryMax,
            String salaryCurrency,
            Integer headcount,
            Instant expiresAt
    ) {}

    public record SkillDto(
            Long id,
            String name,
            String category
    ) {}

    public record CreateSkillRequest(
            String name,
            String category
    ) {}

    public record PageDto<T>(
            List<T> items,
            int page,
            int size,
            long totalElements,
            int totalPages
    ) {}
}
