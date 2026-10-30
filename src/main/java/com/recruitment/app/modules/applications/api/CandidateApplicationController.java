package com.recruitment.app.modules.applications.api;

import com.recruitment.app.modules.applications.api.dto.ApplicationDtos.*;
import com.recruitment.app.modules.applications.application.ApplicationService;
import com.recruitment.app.modules.applications.domain.model.ApplicationSnapshot;
import com.recruitment.app.modules.applications.domain.model.InterviewSnapshot;
import com.recruitment.app.modules.applications.domain.model.OfferSnapshot;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
@PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
public class CandidateApplicationController {

    private final ApplicationService applicationService;

    public CandidateApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping("/api/v1/jobs/{jobId}/applications")
    public ResponseEntity<ApplicationResponse> apply(
            Authentication auth,
            @PathVariable("jobId") Long jobId,
            @RequestBody(required = false) ApplyRequest req
    ) {
        Long userId = getUserId(auth);
        Long resumeId = req != null ? req.candidateResumeId() : null;
        String coverLetter = req != null ? req.coverLetter() : null;

        ApplicationSnapshot app = applicationService.apply(userId, jobId, resumeId, coverLetter);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(app));
    }

    @GetMapping("/api/v1/candidates/me/applications")
    public List<ApplicationResponse> getMyApplications(Authentication auth) {
        Long userId = getUserId(auth);
        return applicationService.getCandidateApplications(userId).stream().map(this::toResponse).toList();
    }

    @GetMapping("/api/v1/candidates/me/applications/{id}")
    public ApplicationResponse getApplication(Authentication auth, @PathVariable("id") Long id) {
        return applicationService.getApplicationById(id).map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
    }

    @PostMapping("/api/v1/candidates/me/applications/{id}/withdraw")
    public ApplicationResponse withdrawApplication(
            Authentication auth,
            @PathVariable("id") Long id,
            @RequestBody(required = false) WithdrawRequest req
    ) {
        Long userId = getUserId(auth);
        String note = req != null ? req.note() : "Withdrawn by candidate";
        ApplicationSnapshot app = applicationService.withdrawApplication(userId, id, note);
        return toResponse(app);
    }

    @GetMapping("/api/v1/candidates/me/interviews")
    public List<InterviewResponse> getMyInterviews(Authentication auth) {
        Long userId = getUserId(auth);
        return applicationService.getCandidateInterviews(userId).stream().map(this::toInterviewResponse).toList();
    }

    @GetMapping("/api/v1/candidates/me/offers")
    public List<OfferResponse> getMyOffers(Authentication auth) {
        Long userId = getUserId(auth);
        return applicationService.getCandidateOffers(userId).stream().map(this::toOfferResponse).toList();
    }

    @GetMapping("/api/v1/candidates/me/offers/{id}")
    public OfferResponse getOffer(@PathVariable("id") Long id) {
        return applicationService.getOfferById(id).map(this::toOfferResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Offer not found"));
    }

    @PostMapping("/api/v1/candidates/me/offers/{id}/accept")
    public OfferResponse acceptOffer(
            Authentication auth,
            @PathVariable("id") Long id,
            @RequestBody(required = false) RespondOfferRequest req
    ) {
        String comment = req != null ? req.comment() : "Accepted by candidate";
        OfferSnapshot offer = applicationService.acceptOffer(id, comment);
        return toOfferResponse(offer);
    }

    @PostMapping("/api/v1/candidates/me/offers/{id}/decline")
    public OfferResponse declineOffer(
            Authentication auth,
            @PathVariable("id") Long id,
            @RequestBody(required = false) RespondOfferRequest req
    ) {
        String comment = req != null ? req.comment() : "Declined by candidate";
        OfferSnapshot offer = applicationService.declineOffer(id, comment);
        return toOfferResponse(offer);
    }

    @RequestMapping(value = "/api/v1/candidates/offers/{id}/response", method = {RequestMethod.POST, RequestMethod.PUT})
    public OfferResponse respondToOffer(
            Authentication auth,
            @PathVariable("id") Long id,
            @RequestBody(required = false) RespondOfferRequest req
    ) {
        String action = req != null && req.action() != null ? req.action() : "ACCEPT";
        String comment = req != null ? req.comment() : null;
        if ("DECLINE".equalsIgnoreCase(action) || "REJECT".equalsIgnoreCase(action)) {
            return toOfferResponse(applicationService.declineOffer(id, comment != null ? comment : "Declined by candidate"));
        } else {
            return toOfferResponse(applicationService.acceptOffer(id, comment != null ? comment : "Accepted by candidate"));
        }
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

    private InterviewResponse toInterviewResponse(InterviewSnapshot i) {
        return new InterviewResponse(
                i.id(), i.jobApplicationId(), i.candidateUserId(), i.recruiterUserId(),
                i.title(), i.scheduledAt(), i.durationMinutes(), i.locationOrUrl(),
                i.status(), i.timezone(), i.notes()
        );
    }

    private OfferResponse toOfferResponse(OfferSnapshot o) {
        return new OfferResponse(
                o.id(), o.jobApplicationId(), o.candidateUserId(), o.createdByUserId(),
                o.salaryOffered(), o.salaryCurrency(), o.startDate(), o.deadline(),
                o.status(), o.termsVersion(), o.notes(), o.candidateComment(), o.respondedAt()
        );
    }
}
