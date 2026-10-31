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
        return apply(userId, jobId, resumeId, coverLetter, null);
    }

    public ApplicationSnapshot apply(Long userId, Long jobId, Long resumeId, String coverLetter, String source) {
        String attribution = ApplicationSource.normalize(source);
        Long open = queryScalarLong("SELECT id FROM jobs WHERE id=? AND status='OPEN' AND (expires_at IS NULL OR expires_at>NOW())", jobId);
        if (open == null) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "Job is not accepting applications");
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

        if (effectiveResumeId != null) {
            Integer owned = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM candidate_resumes WHERE id=? AND candidate_profile_id=?", Integer.class, effectiveResumeId, profileId);
            if (owned == null || owned == 0) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND);
        }
        ApplicationSnapshot app = applicationStore.createApplication(jobId, profileId, effectiveResumeId, coverLetter, attribution);

        // Screening is asynchronous and requires explicit consent and actual provider output.
        // Submission must never manufacture a completed score or infer consent.

        return applicationStore.findById(app.id()).orElse(app);
    }

    @Transactional(readOnly = true)
    public List<ApplicationSnapshot> getCandidateApplications(Long userId) {
        List<Long> profiles = jdbcTemplate.queryForList("SELECT id FROM candidate_profiles WHERE user_id = ?", Long.class, userId);
        return profiles.isEmpty() ? List.of() : applicationStore.findByCandidateProfileId(profiles.getFirst());
    }

    @Transactional(readOnly = true)
    public Optional<ApplicationSnapshot> getApplicationById(Long id) {
        return applicationStore.findById(id);
    }

    public ApplicationSnapshot withdrawApplication(Long userId, Long applicationId, String note) {
        return applicationStore.withdraw(applicationId, userId, note != null ? note : "Withdrawn by candidate");
    }

    @Transactional(readOnly = true)
    public List<ApplicationSnapshot> getRecruiterApplications(Long recruiterUserId, Long jobId, String status, int page, int size) {
        return applicationStore.findRecruiterApplications(recruiterUserId, jobId, status, Math.max(0, page), Math.min(100, Math.max(1, size)));
    }

    @Transactional(readOnly = true)
    public long countRecruiterApplications(Long recruiterUserId, Long jobId, String status) {
        return applicationStore.countRecruiterApplications(recruiterUserId, jobId, status);
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
        if (applicationId != null) {
            targetCandidateUserId = queryScalarLong(
                    "SELECT cp.user_id FROM candidate_profiles cp JOIN job_applications ja ON ja.candidate_profile_id = cp.id WHERE ja.id = ?",
                    applicationId
            );
        }
        Instant effectiveTime = scheduledAt != null ? scheduledAt : Instant.now().plusSeconds(86400 * 2);
        if (!effectiveTime.isAfter(Instant.now())) throw new IllegalArgumentException("Interview must be in the future");
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
        if (applicationId != null) {
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
    public Map<String, Object> getRecruiterOverview(Long user) {
        String members = "SELECT company_id FROM company_members WHERE user_id=? AND is_active=1";
        String jobs = "SELECT id FROM jobs WHERE company_id IN (" + members + ")";
        String applications = "SELECT id FROM job_applications WHERE job_id IN (" + jobs + ")";
        return Map.of("totalJobs", countFor("SELECT COUNT(*) FROM jobs WHERE id IN (" + jobs + ")", user),
                "openJobs", countFor("SELECT COUNT(*) FROM jobs WHERE status='OPEN' AND id IN (" + jobs + ")", user),
                "totalApplications", countFor("SELECT COUNT(*) FROM job_applications WHERE id IN (" + applications + ")", user),
                "pendingReviews", countFor("SELECT COUNT(*) FROM job_applications WHERE status IN ('SUBMITTED','IN_REVIEW') AND id IN (" + applications + ")", user),
                "scheduledInterviews", countFor("SELECT COUNT(*) FROM interviews WHERE status='SCHEDULED' AND job_application_id IN (" + applications + ")", user),
                "activeOffers", countFor("SELECT COUNT(*) FROM job_offers WHERE status='SENT' AND job_application_id IN (" + applications + ")", user));
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getRecruiterFunnel(Long user) {
        var result = new java.util.LinkedHashMap<String, Long>();
        jdbcTemplate.query("""
                SELECT a.status,COUNT(*) AS total FROM job_applications a JOIN jobs j ON j.id=a.job_id
                WHERE EXISTS(SELECT 1 FROM company_members m WHERE m.company_id=j.company_id AND m.user_id=? AND m.is_active=1)
                GROUP BY a.status
                """, rs -> { result.put(rs.getString("status"), rs.getLong("total")); }, user);
        return result;
    }

    private long countFor(String sql, Long user) {
        return java.util.Objects.requireNonNull(jdbcTemplate.queryForObject(sql, Long.class, user));
    }

    private Long getCandidateProfileId(Long userId) {
        try {
            return jdbcTemplate.queryForObject("SELECT id FROM candidate_profiles WHERE user_id = ?", Long.class, userId);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            jdbcTemplate.update("INSERT INTO candidate_profiles (version, created_at, updated_at, user_id, ai_processing_consented) VALUES (0, NOW(), NOW(), ?, 0)", userId);
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

    private long queryCount(String sql) {
        try {
            Long count = jdbcTemplate.queryForObject(sql, Long.class);
            return count != null ? count : 0L;
        } catch (Exception e) {
            return 0L;
        }
    }
}
