package com.recruitment.app.modules.applications.api;

import com.recruitment.app.modules.applications.api.dto.ApplicationDtos.*;
import com.recruitment.app.modules.applications.application.ApplicationService;
import com.recruitment.app.modules.applications.domain.model.FeedbackDraftSnapshot;
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
@PreAuthorize("hasAuthority('ROLE_RECRUITER')")
public class RecruiterInterviewOfferController {

    private final ApplicationService applicationService;

    public RecruiterInterviewOfferController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping("/api/v1/recruiter/interviews")
    public List<InterviewResponse> getRecruiterInterviews(Authentication auth) {
        Long userId = getUserId(auth);
        return applicationService.getRecruiterInterviews(userId).stream().map(this::toInterviewResponse).toList();
    }

    @PostMapping("/api/v1/recruiter/interviews")
    public ResponseEntity<InterviewResponse> scheduleInterview(Authentication auth, @RequestBody ScheduleInterviewRequest req) {
        Long userId = getUserId(auth);
        InterviewSnapshot interview = applicationService.scheduleInterview(
                req.jobApplicationId(), req.candidateUserId(), userId, req.title(),
                req.scheduledAt(), req.durationMinutes(), req.locationOrUrl(), req.timezone(), req.notes()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(toInterviewResponse(interview));
    }

    @PutMapping("/api/v1/recruiter/interviews/{id}")
    public InterviewResponse rescheduleInterview(@PathVariable("id") Long id, @RequestBody RescheduleInterviewRequest req) {
        InterviewSnapshot interview = applicationService.rescheduleInterview(
                id, req.scheduledAt(), req.durationMinutes(), req.locationOrUrl(), req.notes()
        );
        return toInterviewResponse(interview);
    }

    @PostMapping("/api/v1/recruiter/interviews/{id}/cancel")
    public InterviewResponse cancelInterview(@PathVariable("id") Long id, @RequestBody(required = false) CancelInterviewRequest req) {
        String reason = req != null ? req.reason() : "Cancelled by recruiter";
        InterviewSnapshot interview = applicationService.cancelInterview(id, reason);
        return toInterviewResponse(interview);
    }

    @GetMapping("/api/v1/recruiter/offers")
    public List<OfferResponse> getRecruiterOffers(Authentication auth) {
        Long userId = getUserId(auth);
        return applicationService.getRecruiterOffers(userId).stream().map(this::toOfferResponse).toList();
    }

    @PostMapping("/api/v1/recruiter/offers")
    public ResponseEntity<OfferResponse> createOffer(Authentication auth, @RequestBody CreateOfferRequest req) {
        Long userId = getUserId(auth);
        OfferSnapshot offer = applicationService.createOffer(
                req.jobApplicationId(), req.candidateUserId(), userId, req.salaryOffered(),
                req.salaryCurrency(), req.startDate(), req.deadline(), req.notes()
        );
        // Automatically mark as SENT to candidate
        OfferSnapshot sent = applicationService.sendOffer(offer.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(toOfferResponse(sent));
    }

    @PostMapping("/api/v1/recruiter/offers/{id}/withdraw")
    public OfferResponse withdrawOffer(@PathVariable("id") Long id) {
        OfferSnapshot offer = applicationService.withdrawOffer(id);
        return toOfferResponse(offer);
    }

    @GetMapping("/api/v1/recruiter/applications/{id}/offers")
    public List<OfferResponse> getAppOffers(@PathVariable("id") Long id) {
        return applicationService.getApplicationOffers(id).stream().map(this::toOfferResponse).toList();
    }

    @PostMapping("/api/v1/recruiter/applications/{id}/offers")
    public ResponseEntity<OfferResponse> createAppOffer(Authentication auth, @PathVariable("id") Long id, @RequestBody CreateOfferRequest req) {
        Long userId = getUserId(auth);
        OfferSnapshot offer = applicationService.createOffer(id, req.candidateUserId(), userId, req.salaryOffered(), req.salaryCurrency(), req.startDate(), req.deadline(), req.notes());
        return ResponseEntity.status(HttpStatus.CREATED).body(toOfferResponse(applicationService.sendOffer(offer.id())));
    }

    @GetMapping("/api/v1/recruiter/applications/{id}/interviews")
    public List<InterviewResponse> getAppInterviews(@PathVariable("id") Long id) {
        return applicationService.getApplicationInterviews(id).stream().map(this::toInterviewResponse).toList();
    }

    @PostMapping("/api/v1/recruiter/applications/{id}/interviews")
    public ResponseEntity<InterviewResponse> scheduleAppInterview(Authentication auth, @PathVariable("id") Long id, @RequestBody ScheduleInterviewRequest req) {
        Long userId = getUserId(auth);
        InterviewSnapshot i = applicationService.scheduleInterview(id, req.candidateUserId(), userId, req.title(), req.scheduledAt(), req.durationMinutes(), req.locationOrUrl(), req.timezone(), req.notes());
        return ResponseEntity.status(HttpStatus.CREATED).body(toInterviewResponse(i));
    }

    @GetMapping("/api/v1/recruiter/applications/{id}/feedback")
    public FeedbackDraftResponse getAppFeedback(@PathVariable("id") Long id) {
        return applicationService.getApplicationFeedbackDraft(id).map(this::toFeedbackResponse)
                .orElse(new FeedbackDraftResponse(0L, id, null, "", "DRAFT", "PENDING", null, null, null));
    }

    @PutMapping("/api/v1/recruiter/applications/{id}/feedback")
    public FeedbackDraftResponse saveAppFeedback(Authentication auth, @PathVariable("id") Long id, @RequestBody UpdateFeedbackDraftRequest req) {
        return toFeedbackResponse(applicationService.saveFeedbackDraftForApplication(id, getUserId(auth), req.content()));
    }

    @GetMapping("/api/v1/recruiter/feedback-drafts")
    public List<FeedbackDraftResponse> getFeedbackDrafts(Authentication auth) {
        Long userId = getUserId(auth);
        return applicationService.getFeedbackDrafts(userId).stream().map(this::toFeedbackResponse).toList();
    }

    @PostMapping("/api/v1/recruiter/feedback-drafts")
    public ResponseEntity<FeedbackDraftResponse> createFeedbackDraft(Authentication auth, @RequestBody CreateFeedbackDraftRequest req) {
        Long userId = getUserId(auth);
        FeedbackDraftSnapshot draft = applicationService.createFeedbackDraft(req.jobApplicationId(), userId, req.content());
        return ResponseEntity.status(HttpStatus.CREATED).body(toFeedbackResponse(draft));
    }

    @PutMapping("/api/v1/recruiter/feedback-drafts/{id}")
    public FeedbackDraftResponse updateFeedbackDraft(@PathVariable("id") Long id, @RequestBody UpdateFeedbackDraftRequest req) {
        FeedbackDraftSnapshot draft = applicationService.updateFeedbackDraft(id, req.content());
        return toFeedbackResponse(draft);
    }

    @PostMapping("/api/v1/recruiter/feedback-drafts/{id}/approve")
    public FeedbackDraftResponse approveFeedbackDraft(Authentication auth, @PathVariable("id") Long id) {
        Long userId = getUserId(auth);
        FeedbackDraftSnapshot draft = applicationService.approveFeedbackDraft(id, userId);
        return toFeedbackResponse(draft);
    }

    @PostMapping("/api/v1/recruiter/feedback-drafts/{id}/send")
    public FeedbackDraftResponse sendFeedbackDraft(@PathVariable("id") Long id) {
        FeedbackDraftSnapshot draft = applicationService.sendFeedbackDraft(id);
        return toFeedbackResponse(draft);
    }

    private static Long getUserId(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return Long.parseLong(auth.getName());
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

    private FeedbackDraftResponse toFeedbackResponse(FeedbackDraftSnapshot d) {
        return new FeedbackDraftResponse(
                d.id(), d.jobApplicationId(), d.authorUserId(), d.content(),
                d.status(), d.deliveryStatus(), d.approvedByUserId(), d.approvedAt(), d.sentAt()
        );
    }
}
