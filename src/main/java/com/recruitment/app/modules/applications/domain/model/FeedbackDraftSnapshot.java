package com.recruitment.app.modules.applications.domain.model;

import java.time.Instant;

public record FeedbackDraftSnapshot(
        Long id,
        Long jobApplicationId,
        Long authorUserId,
        String content,
        String status,
        String deliveryStatus,
        Long approvedByUserId,
        Instant approvedAt,
        Instant sentAt
) {}
