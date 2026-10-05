package com.recruitment.app.modules.jobs.domain.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record JobSnapshot(
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
        List<SkillSnapshot> skills
) {}
