package com.recruitment.app.modules.candidates.infrastructure.persistence.repository;

import com.recruitment.app.modules.candidates.application.port.out.CandidateProfileStore;
import com.recruitment.app.modules.candidates.domain.model.CandidateProfileSnapshot;
import com.recruitment.app.modules.candidates.domain.model.CandidateSkillSnapshot;
import com.recruitment.app.modules.candidates.domain.model.EducationSnapshot;
import com.recruitment.app.modules.candidates.domain.model.ExperienceSnapshot;
import com.recruitment.app.modules.candidates.domain.model.ResumeSnapshot;
import com.recruitment.app.modules.candidates.infrastructure.persistence.entity.CandidateEducation;
import com.recruitment.app.modules.candidates.infrastructure.persistence.entity.CandidateExperience;
import com.recruitment.app.modules.candidates.infrastructure.persistence.entity.CandidateProfile;
import com.recruitment.app.modules.candidates.infrastructure.persistence.entity.CandidateResume;
import com.recruitment.app.modules.candidates.infrastructure.persistence.entity.CandidateSkill;
import com.recruitment.app.modules.candidates.infrastructure.persistence.entity.EmploymentType;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
@Transactional
public class JpaCandidateProfileStore implements CandidateProfileStore {

    private final CandidateProfileRepository profileRepository;
    private final CandidateResumeRepository resumeRepository;

    public JpaCandidateProfileStore(
            CandidateProfileRepository profileRepository,
            CandidateResumeRepository resumeRepository
    ) {
        this.profileRepository = profileRepository;
        this.resumeRepository = resumeRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CandidateProfileSnapshot> findByUserId(Long userId) {
        return profileRepository.findByUserId(userId).map(this::toSnapshot);
    }

    @Override
    public CandidateProfileSnapshot getOrCreateByUserId(Long userId) {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> profileRepository.save(new CandidateProfile(userId)));
        return toSnapshot(profile);
    }

    @Override
    public CandidateProfileSnapshot updateProfile(Long userId, String phone, String headline, String city, String bio) {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> profileRepository.save(new CandidateProfile(userId)));
        profile.updateProfile(phone, headline, city, bio);
        return toSnapshot(profileRepository.save(profile));
    }

    @Override
    public CandidateProfileSnapshot updateConsent(Long userId, boolean consented) {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> profileRepository.save(new CandidateProfile(userId)));
        profile.updateConsent(consented, Instant.now());
        return toSnapshot(profileRepository.save(profile));
    }

    @Override
    public CandidateProfileSnapshot addEducation(Long userId, EducationSnapshot edu) {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> profileRepository.save(new CandidateProfile(userId)));
        CandidateEducation education = new CandidateEducation(profile, edu.institutionName());
        education.updateDetails(edu.institutionName(), edu.degree(), edu.fieldOfStudy(), edu.startDate(), edu.endDate(), edu.description());
        return toSnapshot(profileRepository.save(profile));
    }

    @Override
    public CandidateProfileSnapshot removeEducation(Long userId, Long educationId) {
        CandidateProfile profile = profileRepository.findByUserId(userId).orElseThrow();
        profile.getEducations().stream()
                .filter(e -> e.getId().equals(educationId))
                .findFirst()
                .ifPresent(profile::removeEducation);
        return toSnapshot(profileRepository.save(profile));
    }

    @Override
    public CandidateProfileSnapshot addExperience(Long userId, ExperienceSnapshot exp) {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> profileRepository.save(new CandidateProfile(userId)));
        EmploymentType empType = EmploymentType.FULL_TIME;
        if (exp.employmentType() != null) {
            try {
                empType = EmploymentType.valueOf(exp.employmentType().toUpperCase());
            } catch (Exception ignored) {}
        }
        CandidateExperience experience = new CandidateExperience(
                profile, exp.companyName(), exp.jobTitle(), empType, exp.startDate()
        );
        experience.updateDetails(exp.companyName(), exp.jobTitle(), empType, exp.startDate(), exp.endDate(), exp.description());
        return toSnapshot(profileRepository.save(profile));
    }

    @Override
    public CandidateProfileSnapshot removeExperience(Long userId, Long experienceId) {
        CandidateProfile profile = profileRepository.findByUserId(userId).orElseThrow();
        profile.getExperiences().stream()
                .filter(e -> e.getId().equals(experienceId))
                .findFirst()
                .ifPresent(profile::removeExperience);
        return toSnapshot(profileRepository.save(profile));
    }

    @Override
    public CandidateProfileSnapshot addSkill(Long userId, Long skillId, String proficiencyLevel, Integer yearsOfExp) {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> profileRepository.save(new CandidateProfile(userId)));
        CandidateSkill.ProficiencyLevel level = CandidateSkill.ProficiencyLevel.INTERMEDIATE;
        if (proficiencyLevel != null) {
            try {
                level = CandidateSkill.ProficiencyLevel.valueOf(proficiencyLevel.toUpperCase());
            } catch (Exception ignored) {}
        }
        CandidateSkill skill = new CandidateSkill(profile, skillId, level, yearsOfExp);
        return toSnapshot(profileRepository.save(profile));
    }

    @Override
    public CandidateProfileSnapshot removeSkill(Long userId, Long candidateSkillId) {
        CandidateProfile profile = profileRepository.findByUserId(userId).orElseThrow();
        profile.getSkills().stream()
                .filter(s -> s.getId().equals(candidateSkillId))
                .findFirst()
                .ifPresent(profile::removeSkill);
        return toSnapshot(profileRepository.save(profile));
    }

    @Override
    public ResumeSnapshot saveResume(Long userId, String originalFileName, String storageKey, String contentType, Long fileSizeBytes, String parsedText) {
        CandidateProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> profileRepository.save(new CandidateProfile(userId)));
        CandidateResume resume = new CandidateResume(profile, originalFileName, storageKey, contentType, fileSizeBytes, parsedText);
        if (profile.getResumes().isEmpty()) {
            profile.setPrimaryResume(resume);
        }
        CandidateResume saved = resumeRepository.save(resume);
        return toResumeSnapshot(saved);
    }

    @Override
    public void setPrimaryResume(Long userId, Long resumeId) {
        CandidateProfile profile = profileRepository.findByUserId(userId).orElseThrow();
        CandidateResume resume = resumeRepository.findByIdAndCandidateProfileId(resumeId, profile.getId()).orElseThrow();
        profile.setPrimaryResume(resume);
        profileRepository.save(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResumeSnapshot> getResumes(Long userId) {
        return profileRepository.findByUserId(userId)
                .map(p -> resumeRepository.findByCandidateProfileId(p.getId()).stream().map(this::toResumeSnapshot).toList())
                .orElse(List.of());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ResumeSnapshot> findResumeById(Long resumeId) {
        return resumeRepository.findById(resumeId).map(this::toResumeSnapshot);
    }

    private CandidateProfileSnapshot toSnapshot(CandidateProfile p) {
        List<EducationSnapshot> edus = p.getEducations().stream().map(e ->
                new EducationSnapshot(e.getId(), e.getInstitutionName(), e.getDegree(), e.getFieldOfStudy(), e.getStartDate(), e.getEndDate(), e.getDescription())
        ).toList();

        List<ExperienceSnapshot> exps = p.getExperiences().stream().map(e ->
                new ExperienceSnapshot(e.getId(), e.getCompanyName(), e.getJobTitle(), e.getEmploymentType() != null ? e.getEmploymentType().name() : null, e.getStartDate(), e.getEndDate(), e.getDescription())
        ).toList();

        List<CandidateSkillSnapshot> skills = p.getSkills().stream().map(s ->
                new CandidateSkillSnapshot(s.getId(), s.getSkillId(), "Skill #" + s.getSkillId(), s.getProficiencyLevel() != null ? s.getProficiencyLevel().name() : "INTERMEDIATE", s.getYearsOfExperience())
        ).toList();

        List<ResumeSnapshot> resumes = p.getResumes().stream().map(this::toResumeSnapshot).toList();

        return new CandidateProfileSnapshot(
                p.getId(), p.getUserId(), p.getPhone(), p.getHeadline(), p.getCity(), p.getBio(),
                p.isAiProcessingConsented(), p.getConsentedAt(), edus, exps, skills, resumes
        );
    }

    private ResumeSnapshot toResumeSnapshot(CandidateResume r) {
        return new ResumeSnapshot(
                r.getId(), r.getCandidateProfile().getId(), r.getOriginalFileName(), r.getStorageKey(),
                r.getContentType(), r.getFileSizeBytes(), r.isPrimaryResume(), r.getScanStatus(), r.getParsedText(), r.getCreatedAt()
        );
    }
}
