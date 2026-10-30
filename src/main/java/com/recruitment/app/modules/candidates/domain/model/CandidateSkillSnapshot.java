package com.recruitment.app.modules.candidates.domain.model;

public record CandidateSkillSnapshot(
        Long id,
        Long skillId,
        String skillName,
        String proficiencyLevel,
        Integer yearsOfExperience
) {}
