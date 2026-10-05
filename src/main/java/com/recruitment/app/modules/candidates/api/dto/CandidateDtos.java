package com.recruitment.app.modules.candidates.api.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public final class CandidateDtos {
    private CandidateDtos() {}

    public record CandidateProfileResponse(
            Long id,
            Long userId,
            String phone,
            String headline,
            String city,
            String bio,
            boolean aiProcessingConsented,
            Instant consentedAt,
            List<EducationDto> educations,
            List<ExperienceDto> experiences,
            List<SkillDto> skills,
            List<ResumeResponse> resumes
    ) {}

    public record UpdateProfileRequest(
            String phone,
            String headline,
            String city,
            String bio
    ) {}

    public record ConsentRequest(
            boolean consented
    ) {}

    public record AddEducationRequest(
            String institutionName,
            String degree,
            String fieldOfStudy,
            LocalDate startDate,
            LocalDate endDate,
            String description
    ) {}

    public record EducationDto(
            Long id,
            String institutionName,
            String degree,
            String fieldOfStudy,
            LocalDate startDate,
            LocalDate endDate,
            String description
    ) {}

    public record AddExperienceRequest(
            String companyName,
            String jobTitle,
            String employmentType,
            LocalDate startDate,
            LocalDate endDate,
            String description
    ) {}

    public record ExperienceDto(
            Long id,
            String companyName,
            String jobTitle,
            String employmentType,
            LocalDate startDate,
            LocalDate endDate,
            String description
    ) {}

    public record AddSkillRequest(
            Long skillId,
            String proficiencyLevel,
            Integer yearsOfExperience
    ) {}

    public record SkillDto(
            Long id,
            Long skillId,
            String skillName,
            String proficiencyLevel,
            Integer yearsOfExperience
    ) {}

    public record ResumeUploadRequest(
            String originalFileName,
            String contentType,
            Long fileSizeBytes,
            String parsedText
    ) {}

    public record ResumeResponse(
            Long id,
            String originalFileName,
            String contentType,
            Long fileSizeBytes,
            boolean primaryResume,
            String scanStatus,
            Instant createdAt
    ) {}
}
