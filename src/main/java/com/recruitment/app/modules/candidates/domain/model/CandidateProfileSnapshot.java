package com.recruitment.app.modules.candidates.domain.model;

import java.time.Instant;
import java.util.List;

public record CandidateProfileSnapshot(
        Long id,
        Long userId,
        String phone,
        String headline,
        String city,
        String bio,
        boolean aiProcessingConsented,
        Instant consentedAt,
        List<EducationSnapshot> educations,
        List<ExperienceSnapshot> experiences,
        List<CandidateSkillSnapshot> skills,
        List<ResumeSnapshot> resumes
) {}
