package com.recruitment.app.modules.applications.infrastructure.persistence.repository;

import com.recruitment.app.modules.applications.application.port.out.ApplicationStore;
import com.recruitment.app.modules.applications.domain.model.*;
import com.recruitment.app.modules.applications.domain.model.ApplicationSnapshot.StatusHistorySnapshot;
import com.recruitment.app.modules.applications.infrastructure.persistence.entity.*;
import com.recruitment.app.modules.applications.infrastructure.persistence.entity.ApplicationEvaluation.Recommendation;
import com.recruitment.app.modules.applications.infrastructure.persistence.entity.JobApplication.ApplicationStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
@Transactional
public class JpaApplicationStore implements ApplicationStore {

    private final JobApplicationRepository applicationRepository;
    private final ApplicationScreeningRepository screeningRepository;
    private final InterviewRepository interviewRepository;
    private final JobOfferRepository offerRepository;
    private final ApplicationEvaluationRepository evaluationRepository;
    private final FeedbackDraftRepository feedbackRepository;
    private final JdbcTemplate jdbcTemplate;

    public JpaApplicationStore(
            JobApplicationRepository applicationRepository,
            ApplicationScreeningRepository screeningRepository,
            InterviewRepository interviewRepository,
            JobOfferRepository offerRepository,
            ApplicationEvaluationRepository evaluationRepository,
            FeedbackDraftRepository feedbackRepository,
            JdbcTemplate jdbcTemplate
    ) {
        this.applicationRepository = applicationRepository;
        this.screeningRepository = screeningRepository;
        this.interviewRepository = interviewRepository;
        this.offerRepository = offerRepository;
        this.evaluationRepository = evaluationRepository;
        this.feedbackRepository = feedbackRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public ApplicationSnapshot createApplication(Long jobId, Long candidateProfileId, Long candidateResumeId, String coverLetter) {
        JobApplication application = new JobApplication(jobId, candidateProfileId, candidateResumeId, coverLetter);
        JobApplication saved = applicationRepository.save(application);
        return toSnapshot(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ApplicationSnapshot> findById(Long id) {
        return applicationRepository.findById(id).map(this::toSnapshot);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ApplicationSnapshot> findByJobAndCandidate(Long jobId, Long candidateProfileId) {
        return applicationRepository.findByJobIdAndCandidateProfileId(jobId, candidateProfileId).map(this::toSnapshot);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationSnapshot> findByCandidateProfileId(Long candidateProfileId) {
        return applicationRepository.findByCandidateProfileIdOrderByCreatedAtDesc(candidateProfileId)
                .stream().map(this::toSnapshot).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationSnapshot> findRecruiterApplications(Long jobId, String status, int page, int size) {
        ApplicationStatus appStatus = parseStatus(status);
        return applicationRepository.findRecruiterApplications(jobId, appStatus, PageRequest.of(page, size))
                .stream().map(this::toSnapshot).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long countRecruiterApplications(Long jobId, String status) {
        ApplicationStatus appStatus = parseStatus(status);
        return applicationRepository.countRecruiterApplications(jobId, appStatus);
    }

    @Override
    public ApplicationSnapshot transitionStatus(Long id, String targetStatus, Long changedByUserId, String note) {
        JobApplication app = applicationRepository.findById(id).orElseThrow();
        ApplicationStatus target = ApplicationStatus.valueOf(targetStatus.toUpperCase());
        app.transitionTo(target, changedByUserId, note, Instant.now());
        return toSnapshot(applicationRepository.save(app));
    }

    @Override
    public ApplicationSnapshot withdraw(Long id, Long changedByUserId, String note) {
        JobApplication app = applicationRepository.findById(id).orElseThrow();
        app.withdraw(changedByUserId, note, Instant.now());
        return toSnapshot(applicationRepository.save(app));
    }

    @Override
    public InterviewSnapshot scheduleInterview(
            Long applicationId, Long candidateUserId, Long recruiterUserId,
            String title, Instant scheduledAt, Integer durationMinutes,
            String locationOrUrl, String timezone, String notes
    ) {
        Interview interview = new Interview(applicationId, candidateUserId, recruiterUserId, title, scheduledAt, durationMinutes, locationOrUrl, timezone, notes);
        Interview saved = interviewRepository.save(interview);
        return toSnapshot(saved);
    }

    @Override
    public InterviewSnapshot rescheduleInterview(Long interviewId, Instant scheduledAt, Integer durationMinutes, String locationOrUrl, String notes) {
        Interview interview = interviewRepository.findById(interviewId).orElseThrow();
        interview.reschedule(scheduledAt, durationMinutes, locationOrUrl, notes);
        return toSnapshot(interviewRepository.save(interview));
    }

    @Override
    public InterviewSnapshot cancelInterview(Long interviewId, String reason) {
        Interview interview = interviewRepository.findById(interviewId).orElseThrow();
        interview.cancel(reason);
        return toSnapshot(interviewRepository.save(interview));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewSnapshot> getCandidateInterviews(Long candidateUserId) {
        return interviewRepository.findByCandidateUserIdOrderByScheduledAtDesc(candidateUserId)
                .stream().map(this::toSnapshot).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewSnapshot> getRecruiterInterviews(Long recruiterUserId) {
        return interviewRepository.findByRecruiterUserIdOrderByScheduledAtDesc(recruiterUserId)
                .stream().map(this::toSnapshot).toList();
    }

    @Override
    public OfferSnapshot createOffer(
            Long applicationId, Long candidateUserId, Long recruiterUserId,
            BigDecimal salary, String currency, LocalDate startDate,
            Instant deadline, String notes
    ) {
        JobOffer offer = new JobOffer(applicationId, candidateUserId, recruiterUserId, salary, currency, startDate, deadline, notes);
        JobOffer saved = offerRepository.save(offer);
        return toSnapshot(saved);
    }

    @Override
    public OfferSnapshot sendOffer(Long offerId) {
        JobOffer offer = offerRepository.findById(offerId).orElseThrow();
        offer.send();
        return toSnapshot(offerRepository.save(offer));
    }

    @Override
    public OfferSnapshot acceptOffer(Long offerId, String comment) {
        JobOffer offer = offerRepository.findById(offerId).orElseThrow();
        offer.accept(comment, Instant.now());
        return toSnapshot(offerRepository.save(offer));
    }

    @Override
    public OfferSnapshot declineOffer(Long offerId, String comment) {
        JobOffer offer = offerRepository.findById(offerId).orElseThrow();
        offer.decline(comment, Instant.now());
        return toSnapshot(offerRepository.save(offer));
    }

    @Override
    public OfferSnapshot withdrawOffer(Long offerId) {
        JobOffer offer = offerRepository.findById(offerId).orElseThrow();
        offer.withdraw();
        return toSnapshot(offerRepository.save(offer));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OfferSnapshot> getCandidateOffers(Long candidateUserId) {
        return offerRepository.findByCandidateUserIdOrderByCreatedAtDesc(candidateUserId)
                .stream().map(this::toSnapshot).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OfferSnapshot> getRecruiterOffers(Long recruiterUserId) {
        return offerRepository.findByCreatedByUserIdOrderByCreatedAtDesc(recruiterUserId)
                .stream().map(this::toSnapshot).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<OfferSnapshot> getOfferById(Long offerId) {
        return offerRepository.findById(offerId).map(this::toSnapshot);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewSnapshot> getApplicationInterviews(Long applicationId) {
        return interviewRepository.findByJobApplicationId(applicationId).stream().map(this::toSnapshot).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OfferSnapshot> getApplicationOffers(Long applicationId) {
        return offerRepository.findByJobApplicationId(applicationId).stream().map(this::toSnapshot).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<FeedbackDraftSnapshot> getApplicationFeedbackDraft(Long applicationId) {
        return feedbackRepository.findByJobApplicationIdOrderByCreatedAtDesc(applicationId).stream().findFirst().map(this::toSnapshot);
    }

    @Override
    public EvaluationSnapshot saveEvaluation(
            Long applicationId, Long evaluatorUserId, int score,
            String recommendation, String techNotes, String cultureNotes,
            String strengths, String growth
    ) {
        Recommendation rec = Recommendation.NEUTRAL;
        try {
            if (recommendation != null) rec = Recommendation.valueOf(recommendation.toUpperCase());
        } catch (Exception ignored) {}
        ApplicationEvaluation eval = new ApplicationEvaluation(applicationId, evaluatorUserId, score, rec, techNotes, cultureNotes, strengths, growth);
        return toSnapshot(evaluationRepository.save(eval));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvaluationSnapshot> getEvaluations(Long applicationId) {
        return evaluationRepository.findByJobApplicationIdOrderByCreatedAtDesc(applicationId)
                .stream().map(this::toSnapshot).toList();
    }

    @Override
    public FeedbackDraftSnapshot createFeedbackDraft(Long applicationId, Long authorUserId, String content) {
        FeedbackDraft draft = new FeedbackDraft(applicationId, authorUserId, content);
        return toSnapshot(feedbackRepository.save(draft));
    }

    @Override
    public FeedbackDraftSnapshot updateFeedbackDraft(Long draftId, String content) {
        FeedbackDraft draft = feedbackRepository.findById(draftId).orElseThrow();
        draft.updateContent(content);
        return toSnapshot(feedbackRepository.save(draft));
    }

    @Override
    public FeedbackDraftSnapshot approveFeedbackDraft(Long draftId, Long approverUserId) {
        FeedbackDraft draft = feedbackRepository.findById(draftId).orElseThrow();
        draft.approve(approverUserId, Instant.now());
        return toSnapshot(feedbackRepository.save(draft));
    }

    @Override
    public FeedbackDraftSnapshot sendFeedbackDraft(Long draftId) {
        FeedbackDraft draft = feedbackRepository.findById(draftId).orElseThrow();
        draft.send(Instant.now());
        return toSnapshot(feedbackRepository.save(draft));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackDraftSnapshot> getFeedbackDrafts(Long authorUserId) {
        return feedbackRepository.findByAuthorUserIdOrderByCreatedAtDesc(authorUserId)
                .stream().map(this::toSnapshot).toList();
    }

    private ApplicationSnapshot toSnapshot(JobApplication a) {
        String jobTitle = queryScalar("SELECT title FROM jobs WHERE id = ?", a.getJobId(), "Job #" + a.getJobId());
        String candName = queryScalar("SELECT u.full_name FROM users u JOIN candidate_profiles cp ON u.id = cp.user_id WHERE cp.id = ?", a.getCandidateProfileId(), "Applicant #" + a.getCandidateProfileId());
        String candEmail = queryScalar("SELECT u.email FROM users u JOIN candidate_profiles cp ON u.id = cp.user_id WHERE cp.id = ?", a.getCandidateProfileId(), "applicant@domain.test");

        List<StatusHistorySnapshot> histories = a.getStatusHistories().stream().map(h ->
                new StatusHistorySnapshot(h.getId(), h.getFromStatus() != null ? h.getFromStatus().name() : null, h.getToStatus().name(), h.getChangedByUserId(), h.getNote(), h.getCreatedAt())
        ).toList();

        Optional<ApplicationScreening> screening = screeningRepository.findTopByJobApplication_IdOrderByAttemptDesc(a.getId());

        return new ApplicationSnapshot(
                a.getId(), a.getJobId(), jobTitle, a.getCandidateProfileId(), candName, candEmail,
                a.getCandidateResumeId(), a.getStatus().name(), a.getCoverLetter(), a.getWithdrawnAt(),
                a.getCreatedAt(),
                screening.map(ApplicationScreening::getScore).orElse(null),
                screening.map(s -> s.getRecommendation() != null ? s.getRecommendation().name() : null).orElse(null),
                screening.map(ApplicationScreening::getSummary).orElse(null),
                screening.map(ApplicationScreening::getMatchedCriteria).orElse(null),
                screening.map(ApplicationScreening::getMissingCriteria).orElse(null),
                histories
        );
    }

    private String queryScalar(String sql, Long param, String fallback) {
        try {
            return jdbcTemplate.queryForObject(sql, String.class, param);
        } catch (Exception e) {
            return fallback;
        }
    }

    private InterviewSnapshot toSnapshot(Interview i) {
        return new InterviewSnapshot(
                i.getId(), i.getJobApplicationId(), i.getCandidateUserId(), i.getRecruiterUserId(),
                i.getTitle(), i.getScheduledAt(), i.getDurationMinutes(), i.getLocationOrUrl(),
                i.getStatus().name(), i.getTimezone(), i.getNotes()
        );
    }

    private OfferSnapshot toSnapshot(JobOffer o) {
        return new OfferSnapshot(
                o.getId(), o.getJobApplicationId(), o.getCandidateUserId(), o.getCreatedByUserId(),
                o.getSalaryOffered(), o.getSalaryCurrency(), o.getStartDate(), o.getDeadline(),
                o.getStatus().name(), o.getTermsVersion(), o.getNotes(), o.getCandidateComment(),
                o.getRespondedAt()
        );
    }

    private EvaluationSnapshot toSnapshot(ApplicationEvaluation e) {
        return new EvaluationSnapshot(
                e.getId(), e.getJobApplicationId(), e.getEvaluatorUserId(), e.getScore(),
                e.getRecommendation().name(), e.getTechnicalNotes(), e.getCulturalFitNotes(),
                e.getStrengths(), e.getAreasForGrowth()
        );
    }

    private FeedbackDraftSnapshot toSnapshot(FeedbackDraft d) {
        return new FeedbackDraftSnapshot(
                d.getId(), d.getJobApplicationId(), d.getAuthorUserId(), d.getContent(),
                d.getStatus().name(), d.getDeliveryStatus() != null ? d.getDeliveryStatus().name() : null,
                d.getApprovedByUserId(), d.getApprovedAt(), d.getSentAt()
        );
    }

    private static ApplicationStatus parseStatus(String status) {
        if (status == null || status.isBlank()) return null;
        try {
            return ApplicationStatus.valueOf(status.toUpperCase().replace('-', '_'));
        } catch (Exception e) {
            return null;
        }
    }
}
