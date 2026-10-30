package com.recruitment.app.modules.candidates.application.port.out;

import com.recruitment.app.modules.candidates.domain.model.CandidateProfileSnapshot;
import com.recruitment.app.modules.candidates.domain.model.EducationSnapshot;
import com.recruitment.app.modules.candidates.domain.model.ExperienceSnapshot;
import com.recruitment.app.modules.candidates.domain.model.ResumeSnapshot;

import java.util.List;
import java.util.Optional;

public interface CandidateProfileStore {

    Optional<CandidateProfileSnapshot> findByUserId(Long userId);

    CandidateProfileSnapshot getOrCreateByUserId(Long userId);

    CandidateProfileSnapshot updateProfile(Long userId, String phone, String headline, String city, String bio);

    CandidateProfileSnapshot updateConsent(Long userId, boolean consented);

    CandidateProfileSnapshot addEducation(Long userId, EducationSnapshot education);

    CandidateProfileSnapshot removeEducation(Long userId, Long educationId);

    CandidateProfileSnapshot addExperience(Long userId, ExperienceSnapshot experience);

    CandidateProfileSnapshot removeExperience(Long userId, Long experienceId);

    CandidateProfileSnapshot addSkill(Long userId, Long skillId, String proficiencyLevel, Integer yearsOfExperience);

    CandidateProfileSnapshot removeSkill(Long userId, Long candidateSkillId);

    ResumeSnapshot saveResume(Long userId, String originalFileName, String storageKey, String contentType, Long fileSizeBytes, String parsedText);

    void setPrimaryResume(Long userId, Long resumeId);

    List<ResumeSnapshot> getResumes(Long userId);

    Optional<ResumeSnapshot> findResumeById(Long resumeId);
}
