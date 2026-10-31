package com.recruitment.app.modules.applications.infrastructure.persistence.repository;

import com.recruitment.app.modules.applications.application.screening.*;
import com.recruitment.app.modules.applications.application.screening.port.out.ScreeningSubmissionStore;
import com.recruitment.app.modules.applications.infrastructure.persistence.entity.ApplicationScreening;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.Arrays;
import java.util.Objects;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.Collections;
import java.time.Instant;

@Repository
public class ScreeningSubmissionAdapter implements ScreeningSubmissionStore {
    private final JdbcTemplate jdbc;
    private final JobApplicationRepository applications;
    private final ApplicationScreeningRepository screenings;
    private final String provider;
    private final String model;
    private final String promptVersion;
    public ScreeningSubmissionAdapter(JdbcTemplate jdbc, JobApplicationRepository applications, ApplicationScreeningRepository screenings,
            @org.springframework.beans.factory.annotation.Value("${app.ai.deepseek.enabled:false}") boolean deepSeek,
            @org.springframework.beans.factory.annotation.Value("${app.ai.deepseek.model:deepseek-flash}") String deepSeekModel,
            @org.springframework.beans.factory.annotation.Value("${app.ai.gemini.model:configured}") String geminiModel) {
        this.jdbc = jdbc; this.applications = applications; this.screenings = screenings;
        this.provider = deepSeek ? "deepseek" : "gemini";
        this.model = deepSeek ? deepSeekModel : (geminiModel == null || geminiModel.isBlank() ? "configured" : geminiModel);
        this.promptVersion = deepSeek ? CvScreeningPolicy.DEEPSEEK_PROMPT_VERSION : CvScreeningPolicy.PROMPT_VERSION;
    }

    @Override
    @Transactional
    public Prepared prepare(Long user, Long applicationId) {
        // Serialize submissions for this application, including repeated clicks and concurrent callers.
        var locked = jdbc.queryForList("SELECT id FROM job_applications WHERE id=? FOR UPDATE", Long.class, applicationId);
        if (locked.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        authorize(user, applicationId);
        var application = applications.findById(applicationId).orElseThrow();
        if (application.getStatus().name().matches("REJECTED|WITHDRAWN"))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Application is no longer eligible");
        var rows = jdbc.queryForList("""
                SELECT j.title,j.description,j.requirements,r.parsed_text,cp.ai_processing_consented
                FROM job_applications a JOIN jobs j ON j.id=a.job_id
                JOIN candidate_profiles cp ON cp.id=a.candidate_profile_id
                LEFT JOIN candidate_resumes r ON r.id=a.candidate_resume_id AND r.candidate_profile_id=cp.id WHERE a.id=?
                """, applicationId);
        var row = rows.getFirst();
        if (!Boolean.parseBoolean(Objects.toString(row.get("ai_processing_consented"))) && !Objects.equals(row.get("ai_processing_consented"), 1))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Candidate AI consent is required");
        String resume = Objects.toString(row.get("parsed_text"), "");
        if (resume.isBlank()) throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Upload a readable CV first");
        String requirements = Objects.toString(row.get("requirements"), "");
        var criteria = Arrays.stream(requirements.split("[\\r\\n;]+" )).map(String::strip)
                .filter(s -> !s.isBlank()).map(s -> s.substring(0, Math.min(s.length(), 500))).limit(40).toList();
        if (criteria.isEmpty()) throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Job criteria are required");
        var request = new CvScreeningRequest(row.get("title").toString(), row.get("description").toString(), criteria, resume);
        String hash = CvScreeningInputFingerprint.sha256(request);
        var last = screenings.findTopByJobApplication_IdOrderByAttemptDesc(applicationId);
        if (last.isPresent() && last.get().getInputHash().equals(hash)
                && last.get().getPromptVersion().equals(promptVersion) && last.get().getProvider().equals(provider)
                && last.get().getModelVersion().equals(model)) {
            var previous = last.get();
            boolean coolingDown = quotaRetryAt() != null || (previous.getNextAttemptAt() != null
                    && previous.getNextAttemptAt().isAfter(Instant.now()));
            if (previous.getStatus() != ApplicationScreening.ScreeningStatus.FAILED || coolingDown) {
                boolean recover = !coolingDown && (previous.getStatus() == ApplicationScreening.ScreeningStatus.PENDING
                        || previous.isLeaseExpired(Instant.now()));
                return new Prepared(previous.getId(), request, recover);
            }
        }
        int attempt = last.map(s -> s.getAttempt() + 1).orElse(1);
        var saved = screenings.saveAndFlush(new ApplicationScreening(application, provider, model, promptVersion, hash, attempt));
        return new Prepared(saved.getId(), request, quotaRetryAt() == null);
    }

    @Override
    @Transactional(readOnly = true)
    public Status status(Long user, Long applicationId) {
        return statuses(user, List.of(applicationId)).get(applicationId);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Long, Status> statuses(Long user, List<Long> ids) {
        if (ids.isEmpty()) return Map.of();
        var args = new java.util.ArrayList<Object>(ids); args.add(user);
        String placeholders = String.join(",", Collections.nCopies(ids.size(), "?"));
        Instant quota = quotaRetryAt();
        var results = new LinkedHashMap<Long, Status>();
        jdbc.query("""
                SELECT a.id AS application_id,s.id,s.status,s.score,s.summary,s.failure_code,s.next_attempt_at,s.retryable
                FROM job_applications a JOIN jobs j ON j.id=a.job_id
                LEFT JOIN application_screenings s ON s.id=(SELECT x.id FROM application_screenings x
                  WHERE x.job_application_id=a.id ORDER BY x.attempt DESC LIMIT 1)
                WHERE a.id IN (""" + placeholders + """
                ) AND EXISTS(SELECT 1 FROM company_members m WHERE m.company_id=j.company_id AND m.user_id=? AND m.is_active=1)
                """, rs -> {
            var timestamp = rs.getTimestamp("next_attempt_at");
            Instant next = timestamp == null ? null : timestamp.toInstant();
            String state = Objects.toString(rs.getString("status"), "NOT_STARTED");
            boolean retryable = rs.getBoolean("retryable");
            String code = rs.getString("failure_code");
            if (quota != null && (state.equals("PENDING") || state.equals("FAILED") && retryable)) {
                state = "WAITING_QUOTA"; next = quota; code = "PROVIDER_QUOTA_EXHAUSTED"; retryable = true;
            } else if (state.equals("FAILED") && retryable && next != null) state = "RETRY_SCHEDULED";
            results.put(rs.getLong("application_id"), new Status(rs.getObject("id", Long.class), state,
                    rs.getObject("score", Integer.class), rs.getString("summary"), code, next, retryable));
        }, args.toArray());
        if (results.size() != ids.stream().distinct().count()) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return results;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Queued> due(int limit) {
        if (quotaRetryAt() != null) return List.of();
        return jdbc.query("""
                SELECT a.id,MIN(m.user_id) AS user_id FROM application_screenings s
                JOIN job_applications a ON a.id=s.job_application_id JOIN jobs j ON j.id=a.job_id
                JOIN candidate_profiles cp ON cp.id=a.candidate_profile_id AND cp.ai_processing_consented=1
                JOIN company_members m ON m.company_id=j.company_id AND m.is_active=1
                JOIN users u ON u.id=m.user_id AND u.is_active=1
                JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id AND r.code='ROLE_RECRUITER'
                WHERE s.id=(SELECT x.id FROM application_screenings x WHERE x.job_application_id=a.id ORDER BY x.attempt DESC LIMIT 1)
                AND a.status NOT IN ('REJECTED','WITHDRAWN') AND (
                  s.status='PENDING' OR (s.status='PROCESSING' AND (s.processing_lease_expires_at IS NULL OR s.processing_lease_expires_at<=?))
                  OR (s.status='FAILED' AND s.retryable=1 AND (s.next_attempt_at IS NULL OR s.next_attempt_at<=?)))
                GROUP BY a.id ORDER BY MIN(s.created_at),a.id LIMIT ?
                """, (rs, n) -> new Queued(rs.getLong("user_id"), rs.getLong("id")), Instant.now(), Instant.now(), Math.min(limit, 100));
    }

    private Instant quotaRetryAt() {
        var value = jdbc.queryForObject("SELECT MAX(next_attempt_at) FROM application_screenings WHERE provider=? AND failure_code='PROVIDER_QUOTA_EXHAUSTED' AND next_attempt_at>?",
                java.sql.Timestamp.class, provider, Instant.now());
        return value == null ? null : value.toInstant();
    }

    private void authorize(Long user, Long id) {
        Integer count = jdbc.queryForObject("""
                SELECT COUNT(*) FROM job_applications a JOIN jobs j ON j.id=a.job_id
                JOIN company_members m ON m.company_id=j.company_id AND m.user_id=? AND m.is_active=1 WHERE a.id=?
                """, Integer.class, user, id);
        if (count == null || count == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }

}
