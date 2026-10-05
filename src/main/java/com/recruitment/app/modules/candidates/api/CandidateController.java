package com.recruitment.app.modules.candidates.api;

import com.recruitment.app.modules.candidates.api.dto.CandidateDtos.*;
import com.recruitment.app.modules.candidates.application.CandidateProfileService;
import com.recruitment.app.modules.candidates.domain.model.CandidateProfileSnapshot;
import com.recruitment.app.modules.candidates.domain.model.ResumeSnapshot;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping(value = "/api/v1/candidates/me", produces = MediaType.APPLICATION_JSON_VALUE)
@PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
public class CandidateController {

    private final CandidateProfileService profileService;

    public CandidateController(CandidateProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public CandidateProfileResponse getMyProfile(Authentication auth) {
        Long userId = getUserId(auth);
        CandidateProfileSnapshot p = profileService.getProfile(userId);
        return toResponse(p);
    }

    @PutMapping
    public CandidateProfileResponse updateMyProfile(Authentication auth, @RequestBody UpdateProfileRequest req) {
        Long userId = getUserId(auth);
        CandidateProfileSnapshot p = profileService.updateProfile(userId, req.phone(), req.headline(), req.city(), req.bio());
        return toResponse(p);
    }

    @PutMapping("/consent")
    public CandidateProfileResponse updateConsent(Authentication auth, @RequestBody ConsentRequest req) {
        Long userId = getUserId(auth);
        CandidateProfileSnapshot p = profileService.updateConsent(userId, req.consented());
        return toResponse(p);
    }

    @PostMapping("/educations")
    public CandidateProfileResponse addEducation(Authentication auth, @RequestBody AddEducationRequest req) {
        Long userId = getUserId(auth);
        CandidateProfileSnapshot p = profileService.addEducation(userId, req.institutionName(), req.degree(), req.fieldOfStudy(), req.startDate(), req.endDate(), req.description());
        return toResponse(p);
    }

    @DeleteMapping("/educations/{id}")
    public CandidateProfileResponse deleteEducation(Authentication auth, @PathVariable("id") Long id) {
        Long userId = getUserId(auth);
        CandidateProfileSnapshot p = profileService.removeEducation(userId, id);
        return toResponse(p);
    }

    @PostMapping("/experiences")
    public CandidateProfileResponse addExperience(Authentication auth, @RequestBody AddExperienceRequest req) {
        Long userId = getUserId(auth);
        CandidateProfileSnapshot p = profileService.addExperience(userId, req.companyName(), req.jobTitle(), req.employmentType(), req.startDate(), req.endDate(), req.description());
        return toResponse(p);
    }

    @DeleteMapping("/experiences/{id}")
    public CandidateProfileResponse deleteExperience(Authentication auth, @PathVariable("id") Long id) {
        Long userId = getUserId(auth);
        CandidateProfileSnapshot p = profileService.removeExperience(userId, id);
        return toResponse(p);
    }

    @PostMapping("/skills")
    public CandidateProfileResponse addSkill(Authentication auth, @RequestBody AddSkillRequest req) {
        Long userId = getUserId(auth);
        CandidateProfileSnapshot p = profileService.addSkill(userId, req.skillId(), req.proficiencyLevel(), req.yearsOfExperience());
        return toResponse(p);
    }

    @DeleteMapping("/skills/{id}")
    public CandidateProfileResponse deleteSkill(Authentication auth, @PathVariable("id") Long id) {
        Long userId = getUserId(auth);
        CandidateProfileSnapshot p = profileService.removeSkill(userId, id);
        return toResponse(p);
    }

    @GetMapping("/resumes")
    public List<ResumeResponse> getResumes(Authentication auth) {
        Long userId = getUserId(auth);
        return profileService.getResumes(userId).stream().map(this::toResumeResponse).toList();
    }

    @PostMapping("/resumes")
    public ResponseEntity<ResumeResponse> uploadResume(Authentication auth, @RequestBody ResumeUploadRequest req) {
        Long userId = getUserId(auth);
        ResumeSnapshot resume = profileService.registerResume(
                userId, req.originalFileName(), req.contentType(),
                req.fileSizeBytes() != null ? req.fileSizeBytes() : 1024L, req.parsedText()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toResumeResponse(resume));
    }

    @PostMapping("/resumes/{id}/primary")
    public ResponseEntity<Void> setPrimaryResume(Authentication auth, @PathVariable("id") Long id) {
        Long userId = getUserId(auth);
        profileService.setPrimaryResume(userId, id);
        return ResponseEntity.noContent().build();
    }

    private static Long getUserId(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return Long.parseLong(auth.getName());
    }

    private CandidateProfileResponse toResponse(CandidateProfileSnapshot p) {
        List<EducationDto> edus = p.educations().stream().map(e ->
                new EducationDto(e.id(), e.institutionName(), e.degree(), e.fieldOfStudy(), e.startDate(), e.endDate(), e.description())
        ).toList();
        List<ExperienceDto> exps = p.experiences().stream().map(e ->
                new ExperienceDto(e.id(), e.companyName(), e.jobTitle(), e.employmentType(), e.startDate(), e.endDate(), e.description())
        ).toList();
        List<SkillDto> skills = p.skills().stream().map(s ->
                new SkillDto(s.id(), s.skillId(), s.skillName(), s.proficiencyLevel(), s.yearsOfExperience())
        ).toList();
        List<ResumeResponse> resumes = p.resumes().stream().map(this::toResumeResponse).toList();

        return new CandidateProfileResponse(
                p.id(), p.userId(), p.phone(), p.headline(), p.city(), p.bio(),
                p.aiProcessingConsented(), p.consentedAt(), edus, exps, skills, resumes
        );
    }

    private ResumeResponse toResumeResponse(ResumeSnapshot r) {
        return new ResumeResponse(
                r.id(), r.originalFileName(), r.contentType(), r.fileSizeBytes(),
                r.primaryResume(), r.scanStatus(), r.createdAt()
        );
    }
}
