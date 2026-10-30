package com.recruitment.app.modules.applications.application;

import com.recruitment.app.modules.applications.domain.model.ApplicationSnapshot;
import com.recruitment.app.modules.applications.domain.model.OfferSnapshot;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** Object ownership is checked inside the same transaction as each mutation. */
@Service
@Transactional
public class CandidateApplicationAccessService {
    private final ApplicationService applications;
    private final JdbcTemplate jdbc;

    public CandidateApplicationAccessService(ApplicationService applications, JdbcTemplate jdbc) {
        this.applications = applications;
        this.jdbc = jdbc;
    }

    @Transactional(readOnly = true)
    public ApplicationSnapshot application(Long userId, Long id) {
        requireApplication(userId, id);
        return applications.getApplicationById(id).orElseThrow(CandidateApplicationAccessService::notFound);
    }

    public ApplicationSnapshot withdraw(Long userId, Long id, String note) {
        requireApplication(userId, id);
        return applications.withdrawApplication(userId, id, note);
    }

    @Transactional(readOnly = true)
    public OfferSnapshot offer(Long userId, Long id) {
        requireOffer(userId, id);
        return applications.getOfferById(id).orElseThrow(CandidateApplicationAccessService::notFound);
    }

    public OfferSnapshot respond(Long userId, Long id, boolean accept, String comment) {
        requireOffer(userId, id);
        return accept ? applications.acceptOffer(id, comment) : applications.declineOffer(id, comment);
    }

    private void requireApplication(Long userId, Long id) {
        Long count = jdbc.queryForObject("""
                SELECT COUNT(*) FROM job_applications a
                JOIN candidate_profiles p ON p.id = a.candidate_profile_id
                WHERE a.id = ? AND p.user_id = ?
                """, Long.class, id, userId);
        if (count == null || count != 1) throw notFound();
    }

    private void requireOffer(Long userId, Long id) {
        Long count = jdbc.queryForObject("SELECT COUNT(*) FROM job_offers WHERE id = ? AND candidate_user_id = ?",
                Long.class, id, userId);
        if (count == null || count != 1) throw notFound();
    }

    private static ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found");
    }
}
