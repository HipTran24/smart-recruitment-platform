package com.recruitment.app.modules.applications.domain.model;

import java.time.Instant;

public record InterviewSnapshot(
        Long id,
        Long jobApplicationId,
        Long candidateUserId,
        Long recruiterUserId,
        String title,
        Instant scheduledAt,
        Integer durationMinutes,
        String locationOrUrl,
        String status,
        String timezone,
        String notes
) {}
