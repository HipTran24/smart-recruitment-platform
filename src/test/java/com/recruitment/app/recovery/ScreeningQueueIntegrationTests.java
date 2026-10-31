package com.recruitment.app.recovery;

import com.recruitment.app.modules.applications.application.screening.port.out.ScreeningSubmissionStore;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ScreeningQueueIntegrationTests extends RecoveryDatabaseTest {
    @Autowired ScreeningSubmissionStore screenings;

    @Test
    void quotaCooldownIsVisibleForEveryQueuedCvAndSurvivesReloadWithoutProviderCalls() throws Exception {
        long recruiter = recruiter();
        long first = readableApplication(recruiter), second = readableApplication(recruiter);
        var attempt = screenings.prepare(recruiter, first);
        screenings.prepare(recruiter, second);
        jdbc.update("UPDATE application_screenings SET status='FAILED',retryable=1,failure_code='PROVIDER_QUOTA_EXHAUSTED',next_attempt_at=NOW()+INTERVAL 14 HOUR WHERE id=?", attempt.id());
        entityManager.clear();
        var statuses = screenings.statuses(recruiter, List.of(first, second));
        assertEquals("WAITING_QUOTA", statuses.get(first).status());
        assertEquals("WAITING_QUOTA", statuses.get(second).status());
        assertNotNull(statuses.get(second).nextAttemptAt());
        assertNull(statuses.get(second).score());
        assertFalse(screenings.prepare(recruiter, second).dispatch());
        assertTrue(screenings.due(8).isEmpty());
        mvc.perform(get("/api/v1/recruiter/screening-statuses").param("ids", first + "," + second)
                        .with(user(Long.toString(recruiter)).roles("RECRUITER")))
                .andExpect(status().isOk()).andExpect(jsonPath("$." + first + ".status").value("WAITING_QUOTA"));
        assertThrows(ResponseStatusException.class, () -> screenings.statuses(createUser(), List.of(first)));
    }

    @Test
    void dispatcherFindsPendingAndExpiredLeasesAndRetriesAfterCooldownExpires() {
        long recruiter = recruiter();
        long first = readableApplication(recruiter), second = readableApplication(recruiter);
        var failed = screenings.prepare(recruiter, first);
        var expired = screenings.prepare(recruiter, second);
        jdbc.update("UPDATE application_screenings SET status='FAILED',retryable=1,failure_code='PROVIDER_QUOTA_EXHAUSTED',next_attempt_at=NOW()-INTERVAL 1 MINUTE WHERE id=?", failed.id());
        jdbc.update("UPDATE application_screenings SET status='PROCESSING',processing_lease_expires_at=NOW()-INTERVAL 1 MINUTE WHERE id=?", expired.id());
        entityManager.clear();
        assertEquals(2, screenings.due(8).size());
        var retried = screenings.prepare(recruiter, first);
        assertTrue(retried.dispatch());
        assertNotEquals(failed.id(), retried.id());
        var recovered = screenings.prepare(recruiter, second);
        assertEquals(expired.id(), recovered.id());
        assertTrue(recovered.dispatch());
        assertEquals(retried.id(), screenings.prepare(recruiter, first).id());
    }

    @Test
    void revokedConsentAndInactiveRecruitersAreNotAutomaticallyDispatched() {
        long recruiter = recruiter(); long app = readableApplication(recruiter);
        screenings.prepare(recruiter, app);
        jdbc.update("UPDATE users SET is_active=0 WHERE id=?", recruiter);
        assertTrue(screenings.due(8).isEmpty());
        jdbc.update("UPDATE users SET is_active=1 WHERE id=?", recruiter);
        jdbc.update("UPDATE candidate_profiles SET ai_processing_consented=0 WHERE id=(SELECT candidate_profile_id FROM job_applications WHERE id=?)", app);
        assertTrue(screenings.due(8).isEmpty());
    }

    private long recruiter() {
        long id = createUser();
        jdbc.update("INSERT INTO user_roles(user_id,role_id) SELECT ?,id FROM roles WHERE code='ROLE_RECRUITER'", id);
        return id;
    }

    private long readableApplication(long recruiter) {
        long candidate = createUser(), job = job(recruiter), profile = profile(candidate);
        jdbc.update("UPDATE jobs SET requirements='Java;SQL' WHERE id=?", job);
        jdbc.update("UPDATE candidate_profiles SET ai_processing_consented=1,consented_at=NOW() WHERE id=?", profile);
        jdbc.update("INSERT INTO candidate_resumes(version,created_at,updated_at,candidate_profile_id,original_file_name,storage_key,content_type,file_size_bytes,is_primary,scan_status,parsed_text) VALUES(0,NOW(),NOW(),?,'cv.pdf',?,'application/pdf',100,1,'PENDING','Java Spring SQL experience')", profile, UUID.randomUUID().toString());
        long resume = lastId(), app = application(job, profile);
        jdbc.update("UPDATE job_applications SET candidate_resume_id=? WHERE id=?", resume, app);
        return app;
    }
}
