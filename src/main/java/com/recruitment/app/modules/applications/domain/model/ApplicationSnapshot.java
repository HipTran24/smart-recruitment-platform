package com.recruitment.app.modules.applications.domain.model;

import java.time.Instant;
import java.util.List;

public record ApplicationSnapshot(
        Long id,
        Long jobId,
        String jobTitle,
        Long candidateProfileId,
        String candidateName,
        String candidateEmail,
        Long candidateResumeId,
        String status,
        String coverLetter,
        Instant withdrawnAt,
        Instant createdAt,
        Integer screeningScore,
        String screeningRecommendation,
        String screeningSummary,
        String matchedCriteria,
        String missingCriteria,
        List<StatusHistorySnapshot> histories
) {
    public record StatusHistorySnapshot(
            Long id,
            String fromStatus,
            String toStatus,
            Long changedByUserId,
            String note,
            Instant createdAt
    ) {}
}
