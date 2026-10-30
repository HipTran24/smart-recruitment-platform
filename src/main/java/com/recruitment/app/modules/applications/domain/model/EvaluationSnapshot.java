package com.recruitment.app.modules.applications.domain.model;

public record EvaluationSnapshot(
        Long id,
        Long jobApplicationId,
        Long evaluatorUserId,
        Integer score,
        String recommendation,
        String technicalNotes,
        String culturalFitNotes,
        String strengths,
        String areasForGrowth
) {}
