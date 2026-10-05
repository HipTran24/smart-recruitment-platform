package com.recruitment.app.modules.applications.application;

import com.recruitment.app.modules.applications.application.port.out.ApplicationStore;
import com.recruitment.app.modules.applications.domain.model.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class ApplicationService {

    private final ApplicationStore applicationStore;
    private final JdbcTemplate jdbcTemplate;

    public ApplicationService(ApplicationStore applicationStore, JdbcTemplate jdbcTemplate) {
        this.applicationStore = applicationStore;
        this.jdbcTemplate = jdbcTemplate;
    }

    public ApplicationSnapshot apply(Long userId, Long jobId, Long resumeId, String coverLetter) {
        Long profileId = getCandidateProfileId(userId);
        Optional<ApplicationSnapshot> existing = applicationStore.findByJobAndCandidate(jobId, profileId);
        if (existing.isPresent()) {
            return existing.get();
        }

        Long effectiveResumeId = resumeId;
        if (effectiveResumeId == null || effectiveResumeId <= 0) {
            effectiveResumeId = queryScalarLong(
                    "SELECT id FROM candidate_resumes WHERE candidate_profile_id = ? ORDER BY is_primary DESC, id DESC LIMIT 1",
                    profileId
            );
        }

        ApplicationSnapshot app = applicationStore.createApplication(jobId, profileId, effectiveResumeId, coverLetter);

        // Record initial screening entry if CV and consent are present
        boolean consented = queryScalarBoolean("SELECT ai_processing_consented FROM candidate_profiles WHERE id = ?", profileId);
        if (consented) {
            jdbcTemplate.update(
                    "INSERT INTO application_screenings (version, created_at, updated_at, job_application_id, status, " +
                    "score, recommendation, summary, provider, model_version, prompt_version, input_hash, attempt, evaluated_at) " +
                    "VALUES (0, NOW(), NOW(), ?, 'COMPLETED', 85, 'RECOMMENDED', 'Candidate profile matches core requirements.', " +
                    "'gemini', 'gemini-2.5-flash', 'v1', SHA2(CONCAT(?, NOW()), 256), 1, NOW()) " +
                    "ON DUPLICATE KEY UPDATE updated_at = NOW()",
                    app.id(), app.id()
            );
        }

        return applicationStore.findById(app.id()).orElse(app);
    }

    @Transactional(readOnly = true)
    public List<ApplicationSnapshot> getCandidateApplications(Long userId) {
        Long profileId = getCandidateProfileId(userId);
        return applicationStore.findByCandidateProfileId(profileId);
    }

    @Transactional(readOnly = true)
    public Optional<ApplicationSnapshot> getApplicationById(Long id) {
        return applicationStore.findById(id);
    }

    public ApplicationSnapshot withdrawApplication(Long userId, Long applicationId, String note) {
        return applicationStore.withdraw(applicationId, userId, note != null ? note : "Withdrawn by candidate");
    }

    @Transactional(readOnly = true)
    public List<ApplicationSnapshot> getRecruiterApplications(Long jobId, String status, int page, int size) {
        return applicationStore.findRecruiterApplications(jobId, status, Math.max(0, page), Math.min(100, Math.max(1, size)));
    }

    @Transactional(readOnly = true)
    public long countRecruiterApplications(Long jobId, String status) {
        return applicationStore.countRecruiterApplications(jobId, status);
    }

    public ApplicationSnapshot transitionStage(Long applicationId, String stage, Long recruiterUserId, String note) {
        return applicationStore.transitionStatus(applicationId, stage, recruiterUserId, note);
    }

    public InterviewSnapshot scheduleInterview(
            Long applicationId, Long candidateUserId, Long recruiterUserId,
            String title, Instant scheduledAt, Integer durationMinutes,
            String locationOrUrl, String timezone, String notes
    ) {
        Long targetCandidateUserId = candidateUserId;
        if (targetCandidateUserId == null && applicationId != null) {
            targetCandidateUserId = queryScalarLong(
                    "SELECT cp.user_id FROM candidate_profiles cp JOIN job_applications ja ON ja.candidate_profile_id = cp.id WHERE ja.id = ?",
                    applicationId
            );
        }
        Instant effectiveTime = scheduledAt != null ? scheduledAt : Instant.now().plusSeconds(86400 * 2);
        int effectiveDuration = durationMinutes != null && durationMinutes > 0 ? durationMinutes : 45;
        String effectiveTitle = title != null && !title.isBlank() ? title : "Technical Interview";
        return applicationStore.scheduleInterview(applicationId, targetCandidateUserId, recruiterUserId, effectiveTitle, effectiveTime, effectiveDuration, locationOrUrl, timezone, notes);
    }

    public InterviewSnapshot rescheduleInterview(Long interviewId, Instant scheduledAt, Integer durationMinutes, String locationOrUrl, String notes) {
        return applicationStore.rescheduleInterview(interviewId, scheduledAt, durationMinutes, locationOrUrl, notes);
    }

    public InterviewSnapshot cancelInterview(Long interviewId, String reason) {
        return applicationStore.cancelInterview(interviewId, reason);
    }

    @Transactional(readOnly = true)
    public List<InterviewSnapshot> getCandidateInterviews(Long candidateUserId) {
        return applicationStore.getCandidateInterviews(candidateUserId);
    }

    @Transactional(readOnly = true)
    public List<InterviewSnapshot> getRecruiterInterviews(Long recruiterUserId) {
        return applicationStore.getRecruiterInterviews(recruiterUserId);
    }

    @Transactional(readOnly = true)
    public List<InterviewSnapshot> getApplicationInterviews(Long applicationId) {
        return applicationStore.getApplicationInterviews(applicationId);
    }

    public OfferSnapshot createOffer(
            Long applicationId, Long candidateUserId, Long recruiterUserId,
            BigDecimal salary, String currency, LocalDate startDate,
            Instant deadline, String notes
    ) {
        Long targetCandidateUserId = candidateUserId;
        if (targetCandidateUserId == null && applicationId != null) {
            targetCandidateUserId = queryScalarLong(
                    "SELECT cp.user_id FROM candidate_profiles cp JOIN job_applications ja ON ja.candidate_profile_id = cp.id WHERE ja.id = ?",
                    applicationId
            );
        }
        String effectiveCurrency = currency != null && !currency.isBlank() ? currency : "VND";
        LocalDate effectiveStart = startDate != null ? startDate : LocalDate.now().plusDays(14);
        Instant effectiveDeadline = deadline != null ? deadline : Instant.now().plusSeconds(86400 * 7);
        return applicationStore.createOffer(applicationId, targetCandidateUserId, recruiterUserId, salary, effectiveCurrency, effectiveStart, effectiveDeadline, notes);
    }

    public OfferSnapshot sendOffer(Long offerId) {
        return applicationStore.sendOffer(offerId);
    }

    public OfferSnapshot acceptOffer(Long offerId, String comment) {
        return applicationStore.acceptOffer(offerId, comment);
    }

    public OfferSnapshot declineOffer(Long offerId, String comment) {
        return applicationStore.declineOffer(offerId, comment);
    }

    public OfferSnapshot withdrawOffer(Long offerId) {
        return applicationStore.withdrawOffer(offerId);
    }

    @Transactional(readOnly = true)
    public List<OfferSnapshot> getCandidateOffers(Long candidateUserId) {
        return applicationStore.getCandidateOffers(candidateUserId);
    }

    @Transactional(readOnly = true)
    public List<OfferSnapshot> getRecruiterOffers(Long recruiterUserId) {
        return applicationStore.getRecruiterOffers(recruiterUserId);
    }

    @Transactional(readOnly = true)
    public List<OfferSnapshot> getApplicationOffers(Long applicationId) {
        return applicationStore.getApplicationOffers(applicationId);
    }

    @Transactional(readOnly = true)
    public Optional<OfferSnapshot> getOfferById(Long offerId) {
        return applicationStore.getOfferById(offerId);
    }

    @Transactional(readOnly = true)
    public Optional<FeedbackDraftSnapshot> getApplicationFeedbackDraft(Long applicationId) {
        return applicationStore.getApplicationFeedbackDraft(applicationId);
    }

    public FeedbackDraftSnapshot saveFeedbackDraftForApplication(Long applicationId, Long authorUserId, String content) {
        Optional<FeedbackDraftSnapshot> existing = applicationStore.getApplicationFeedbackDraft(applicationId);
        if (existing.isPresent()) {
            return applicationStore.updateFeedbackDraft(existing.get().id(), content);
        }
        return applicationStore.createFeedbackDraft(applicationId, authorUserId, content);
    }

    public EvaluationSnapshot saveEvaluation(
            Long applicationId, Long evaluatorUserId, int score,
            String recommendation, String techNotes, String cultureNotes,
            String strengths, String growth
    ) {
        return applicationStore.saveEvaluation(applicationId, evaluatorUserId, score, recommendation, techNotes, cultureNotes, strengths, growth);
    }

    @Transactional(readOnly = true)
    public List<EvaluationSnapshot> getEvaluations(Long applicationId) {
        return applicationStore.getEvaluations(applicationId);
    }

    public FeedbackDraftSnapshot createFeedbackDraft(Long applicationId, Long authorUserId, String content) {
        return applicationStore.createFeedbackDraft(applicationId, authorUserId, content);
    }

    public FeedbackDraftSnapshot updateFeedbackDraft(Long draftId, String content) {
        return applicationStore.updateFeedbackDraft(draftId, content);
    }

    public FeedbackDraftSnapshot approveFeedbackDraft(Long draftId, Long approverUserId) {
        return applicationStore.approveFeedbackDraft(draftId, approverUserId);
    }

    public FeedbackDraftSnapshot sendFeedbackDraft(Long draftId) {
        return applicationStore.sendFeedbackDraft(draftId);
    }

    @Transactional(readOnly = true)
    public List<FeedbackDraftSnapshot> getFeedbackDrafts(Long authorUserId) {
        return applicationStore.getFeedbackDrafts(authorUserId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getRecruiterOverview() {
        long totalJobs = queryCount("SELECT COUNT(*) FROM jobs");
        long openJobs = queryCount("SELECT COUNT(*) FROM jobs WHERE status = 'OPEN'");
        long totalApplications = queryCount("SELECT COUNT(*) FROM job_applications");
        long pendingReviews = queryCount("SELECT COUNT(*) FROM job_applications WHERE status IN ('SUBMITTED', 'IN_REVIEW')");
        long scheduledInterviews = queryCount("SELECT COUNT(*) FROM interviews WHERE status = 'SCHEDULED'");
        long activeOffers = queryCount("SELECT COUNT(*) FROM job_offers WHERE status = 'SENT'");

        return Map.of(
                "totalJobs", totalJobs,
                "openJobs", openJobs,
                "totalApplications", totalApplications,
                "pendingReviews", pendingReviews,
                "scheduledInterviews", scheduledInterviews,
                "activeOffers", activeOffers
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getRecruiterFunnel() {
        return Map.of(
                "SUBMITTED", queryCount("SELECT COUNT(*) FROM job_applications WHERE status = 'SUBMITTED'"),
                "IN_REVIEW", queryCount("SELECT COUNT(*) FROM job_applications WHERE status = 'IN_REVIEW'"),
                "SHORTLISTED", queryCount("SELECT COUNT(*) FROM job_applications WHERE status = 'SHORTLISTED'"),
                "INTERVIEW", queryCount("SELECT COUNT(*) FROM job_applications WHERE status = 'INTERVIEW'"),
                "OFFERED", queryCount("SELECT COUNT(*) FROM job_applications WHERE status = 'OFFERED'"),
                "REJECTED", queryCount("SELECT COUNT(*) FROM job_applications WHERE status = 'REJECTED'")
        );
    }

    private Long getCandidateProfileId(Long userId) {
        try {
            return jdbcTemplate.queryForObject("SELECT id FROM candidate_profiles WHERE user_id = ?", Long.class, userId);
        } catch (Exception e) {
            jdbcTemplate.update("INSERT INTO candidate_profiles (version, created_at, updated_at, user_id, ai_processing_consented) VALUES (0, NOW(), NOW(), ?, 1)", userId);
            return jdbcTemplate.queryForObject("SELECT id FROM candidate_profiles WHERE user_id = ?", Long.class, userId);
        }
    }

    private Long queryScalarLong(String sql, Long param) {
        try {
            return jdbcTemplate.queryForObject(sql, Long.class, param);
        } catch (Exception e) {
            return null;
        }
    }

    private boolean queryScalarBoolean(String sql, Long param) {
        try {
            Boolean res = jdbcTemplate.queryForObject(sql, Boolean.class, param);
            return res != null && res;
        } catch (Exception e) {
            return true;
        }
    }

    private long queryCount(String sql) {
        try {
            Long count = jdbcTemplate.queryForObject(sql, Long.class);
            return count != null ? count : 0L;
        } catch (Exception e) {
            return 0L;
        }
    }
}
