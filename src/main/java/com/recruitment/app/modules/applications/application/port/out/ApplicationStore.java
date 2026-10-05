package com.recruitment.app.modules.applications.application.port.out;

import com.recruitment.app.modules.applications.domain.model.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ApplicationStore {

    ApplicationSnapshot createApplication(Long jobId, Long candidateProfileId, Long candidateResumeId, String coverLetter);

    Optional<ApplicationSnapshot> findById(Long id);

    Optional<ApplicationSnapshot> findByJobAndCandidate(Long jobId, Long candidateProfileId);

    List<ApplicationSnapshot> findByCandidateProfileId(Long candidateProfileId);

    List<ApplicationSnapshot> findRecruiterApplications(Long jobId, String status, int page, int size);

    long countRecruiterApplications(Long jobId, String status);

    ApplicationSnapshot transitionStatus(Long id, String targetStatus, Long changedByUserId, String note);

    ApplicationSnapshot withdraw(Long id, Long changedByUserId, String note);

    InterviewSnapshot scheduleInterview(
            Long applicationId, Long candidateUserId, Long recruiterUserId,
            String title, Instant scheduledAt, Integer durationMinutes,
            String locationOrUrl, String timezone, String notes
    );

    InterviewSnapshot rescheduleInterview(Long interviewId, Instant scheduledAt, Integer durationMinutes, String locationOrUrl, String notes);

    InterviewSnapshot cancelInterview(Long interviewId, String reason);

    List<InterviewSnapshot> getCandidateInterviews(Long candidateUserId);

    List<InterviewSnapshot> getRecruiterInterviews(Long recruiterUserId);

    OfferSnapshot createOffer(
            Long applicationId, Long candidateUserId, Long recruiterUserId,
            BigDecimal salary, String currency, LocalDate startDate,
            Instant deadline, String notes
    );

    OfferSnapshot sendOffer(Long offerId);

    OfferSnapshot acceptOffer(Long offerId, String comment);

    OfferSnapshot declineOffer(Long offerId, String comment);

    OfferSnapshot withdrawOffer(Long offerId);

    List<OfferSnapshot> getCandidateOffers(Long candidateUserId);

    List<OfferSnapshot> getRecruiterOffers(Long recruiterUserId);

    Optional<OfferSnapshot> getOfferById(Long offerId);

    List<InterviewSnapshot> getApplicationInterviews(Long applicationId);

    List<OfferSnapshot> getApplicationOffers(Long applicationId);

    Optional<FeedbackDraftSnapshot> getApplicationFeedbackDraft(Long applicationId);

    EvaluationSnapshot saveEvaluation(
            Long applicationId, Long evaluatorUserId, int score,
            String recommendation, String techNotes, String cultureNotes,
            String strengths, String growth
    );

    List<EvaluationSnapshot> getEvaluations(Long applicationId);

    FeedbackDraftSnapshot createFeedbackDraft(Long applicationId, Long authorUserId, String content);

    FeedbackDraftSnapshot updateFeedbackDraft(Long draftId, String content);

    FeedbackDraftSnapshot approveFeedbackDraft(Long draftId, Long approverUserId);

    FeedbackDraftSnapshot sendFeedbackDraft(Long draftId);

    List<FeedbackDraftSnapshot> getFeedbackDrafts(Long authorUserId);
}
