package com.recruitment.app.modules.candidates.application;

import com.recruitment.app.modules.candidates.application.port.out.CandidateProfileStore;
import com.recruitment.app.modules.candidates.domain.model.CandidateProfileSnapshot;
import com.recruitment.app.modules.candidates.domain.model.EducationSnapshot;
import com.recruitment.app.modules.candidates.domain.model.ExperienceSnapshot;
import com.recruitment.app.modules.candidates.domain.model.ResumeSnapshot;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class CandidateProfileService {

    private final CandidateProfileStore profileStore;

    public CandidateProfileService(CandidateProfileStore profileStore) {
        this.profileStore = profileStore;
    }

    @Transactional
    public CandidateProfileSnapshot getProfile(Long userId) {
        return profileStore.findByUserId(userId)
                .orElseGet(() -> profileStore.getOrCreateByUserId(userId));
    }

    public CandidateProfileSnapshot updateProfile(Long userId, String phone, String headline, String city, String bio) {
        return profileStore.updateProfile(userId, phone, headline, city, bio);
    }

    public CandidateProfileSnapshot updateConsent(Long userId, boolean consented) {
        return profileStore.updateConsent(userId, consented);
    }

    public CandidateProfileSnapshot addEducation(
            Long userId, String institutionName, String degree, String fieldOfStudy,
            LocalDate startDate, LocalDate endDate, String description
    ) {
        EducationSnapshot edu = new EducationSnapshot(null, institutionName, degree, fieldOfStudy, startDate, endDate, description);
        return profileStore.addEducation(userId, edu);
    }

    public CandidateProfileSnapshot removeEducation(Long userId, Long educationId) {
        return profileStore.removeEducation(userId, educationId);
    }

    public CandidateProfileSnapshot addExperience(
            Long userId, String companyName, String jobTitle, String employmentType,
            LocalDate startDate, LocalDate endDate, String description
    ) {
        ExperienceSnapshot exp = new ExperienceSnapshot(null, companyName, jobTitle, employmentType, startDate, endDate, description);
        return profileStore.addExperience(userId, exp);
    }

    public CandidateProfileSnapshot removeExperience(Long userId, Long experienceId) {
        return profileStore.removeExperience(userId, experienceId);
    }

    public CandidateProfileSnapshot addSkill(Long userId, Long skillId, String proficiencyLevel, Integer yearsOfExp) {
        return profileStore.addSkill(userId, skillId, proficiencyLevel, yearsOfExp);
    }

    public CandidateProfileSnapshot removeSkill(Long userId, Long skillId) {
        return profileStore.removeSkill(userId, skillId);
    }

    public ResumeSnapshot registerResume(
            Long userId, String originalFileName, String contentType, long fileSize, String parsedText
    ) {
        String storageKey = "cv/" + userId + "/" + UUID.randomUUID() + "-" + originalFileName.replaceAll("[^a-zA-Z0-9._-]", "_");
        return profileStore.saveResume(userId, originalFileName, storageKey, contentType, fileSize, parsedText);
    }

    public void setPrimaryResume(Long userId, Long resumeId) {
        profileStore.setPrimaryResume(userId, resumeId);
    }

    @Transactional(readOnly = true)
    public List<ResumeSnapshot> getResumes(Long userId) {
        return profileStore.getResumes(userId);
    }

    @Transactional(readOnly = true)
    public Optional<ResumeSnapshot> getResumeById(Long resumeId) {
        return profileStore.findResumeById(resumeId);
    }
}
