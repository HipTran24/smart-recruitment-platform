package com.recruitment.app.modules.applications.api;

import com.recruitment.app.modules.applications.api.dto.ApplicationDtos.*;
import com.recruitment.app.modules.applications.application.ApplicationService;
import com.recruitment.app.modules.applications.domain.model.ApplicationSnapshot;
import com.recruitment.app.modules.applications.domain.model.EvaluationSnapshot;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
@PreAuthorize("hasAuthority('ROLE_RECRUITER')")
public class RecruiterApplicationController {

    private final ApplicationService applicationService;

    public RecruiterApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping("/api/v1/recruiter/applications")
    public PageDto<ApplicationResponse> getApplications(
            Authentication auth,
            @RequestParam(name = "jobId", required = false) Long jobId,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size
    ) {
        List<ApplicationSnapshot> apps = applicationService.getRecruiterApplications(getUserId(auth), jobId, status, Math.max(0, page), Math.min(100, Math.max(1, size)));
        long total = applicationService.countRecruiterApplications(getUserId(auth), jobId, status);
        page = Math.max(0, page);
        size = Math.min(100, Math.max(1, size));
        int totalPages = (int) Math.ceil((double) total / size);

        List<ApplicationResponse> items = apps.stream().map(this::toResponse).toList();
        return new PageDto<>(items, page, size, total, totalPages);
    }

    @GetMapping("/api/v1/recruiter/applications/{id}")
    @PreAuthorize("hasAuthority('ROLE_RECRUITER') and @recruiterAccess.application(authentication.name, #id)")
    public ApplicationResponse getApplicationDossier(@PathVariable("id") Long id) {
        return applicationService.getApplicationById(id).map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
    }

    @PostMapping("/api/v1/recruiter/applications/{id}/transitions")
    @PreAuthorize("hasAuthority('ROLE_RECRUITER') and @recruiterAccess.application(authentication.name, #id)")
    public ApplicationResponse transitionStage(
            Authentication auth,
            @PathVariable("id") Long id,
            @RequestBody TransitionStageRequest req
    ) {
        Long userId = getUserId(auth);
        ApplicationSnapshot app = applicationService.transitionStage(id, req.stage(), userId, req.note());
        return toResponse(app);
    }

    @GetMapping("/api/v1/recruiter/applications/{id}/evaluations")
    @PreAuthorize("hasAuthority('ROLE_RECRUITER') and @recruiterAccess.application(authentication.name, #id)")
    public List<EvaluationResponse> getEvaluations(@PathVariable("id") Long id) {
        return applicationService.getEvaluations(id).stream().map(this::toEvaluationResponse).toList();
    }

    @PostMapping("/api/v1/recruiter/applications/{id}/evaluations")
    @PreAuthorize("hasAuthority('ROLE_RECRUITER') and @recruiterAccess.application(authentication.name, #id)")
    public ResponseEntity<EvaluationResponse> submitEvaluation(
            Authentication auth,
            @PathVariable("id") Long id,
            @jakarta.validation.Valid @RequestBody CreateEvaluationRequest req
    ) {
        Long userId = getUserId(auth);
        EvaluationSnapshot eval = applicationService.saveEvaluation(
                id, userId, req.score() != null ? req.score() : 0, req.recommendation(),
                req.technicalNotes(), req.culturalFitNotes(), req.strengths(), req.areasForGrowth()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toEvaluationResponse(eval));
    }

    @GetMapping("/api/v1/recruiter/reports/overview")
    public Map<String, Object> getOverview(Authentication auth) {
        return applicationService.getRecruiterOverview(getUserId(auth));
    }

    @GetMapping("/api/v1/recruiter/reports/funnel")
    public Map<String, Long> getFunnel(Authentication auth) {
        return applicationService.getRecruiterFunnel(getUserId(auth));
    }

    private static Long getUserId(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return Long.parseLong(auth.getName());
    }

    private ApplicationResponse toResponse(ApplicationSnapshot a) {
        List<StatusHistoryDto> histories = a.histories().stream().map(h ->
                new StatusHistoryDto(h.id(), h.fromStatus(), h.toStatus(), h.changedByUserId(), h.note(), h.createdAt())
        ).toList();

        return new ApplicationResponse(
                a.id(), a.jobId(), a.jobTitle(), a.candidateProfileId(), a.candidateName(),
                a.candidateEmail(), a.candidateResumeId(), a.status(), a.coverLetter(),
                a.withdrawnAt(), a.createdAt(), a.screeningScore(), a.screeningRecommendation(),
                a.screeningSummary(), a.matchedCriteria(), a.missingCriteria(), histories
        );
    }

    private EvaluationResponse toEvaluationResponse(EvaluationSnapshot e) {
        return new EvaluationResponse(
                e.id(), e.jobApplicationId(), e.evaluatorUserId(), e.score(),
                e.recommendation(), e.technicalNotes(), e.culturalFitNotes(),
                e.strengths(), e.areasForGrowth()
        );
    }
}
