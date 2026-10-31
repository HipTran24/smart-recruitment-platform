package com.recruitment.app.recovery;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ReportVerificationIntegrationTests extends RecoveryDatabaseTest {

    @Test
    void controlledCohortVerifiesBoundariesJobSourceAndDuplicateHistory()
            throws Exception {
        long recruiter = createUser();
        long job = job(recruiter);
        long otherJob = job(recruiter);

        long beforeStart = application(job, profile(createUser()));
        long atStart = application(job, profile(createUser()));
        long inside = application(job, profile(createUser()));
        long other = application(otherJob, profile(createUser()));
        long atEnd = application(job, profile(createUser()));

        setApplication(beforeStart, "2026-09-30T16:59:59",
                "PORTAL", "SUBMITTED");
        setApplication(atStart, "2026-09-30T17:00:00",
                "PORTAL", "IN_REVIEW");
        setApplication(inside, "2026-10-01T12:00:00",
                "REFERRAL", "INTERVIEW");
        setApplication(other, "2026-10-01T16:59:59",
                "UNKNOWN", "REJECTED");
        setApplication(atEnd, "2026-10-01T17:00:00",
                "PORTAL", "OFFERED");

        for (long id : new long[]{beforeStart, atStart, inside, other, atEnd}) {
            jdbc.update(
                    "DELETE FROM application_status_histories WHERE job_application_id=?",
                    id
            );
        }

        history(atStart, "SUBMITTED");
        history(atStart, "IN_REVIEW");
        history(atStart, "IN_REVIEW");

        history(inside, "SUBMITTED");
        history(inside, "IN_REVIEW");
        history(inside, "SHORTLISTED");
        history(inside, "INTERVIEW");

        mvc.perform(get("/api/v1/recruiter/kpis")
                        .with(user(Long.toString(recruiter)).roles("RECRUITER"))
                        .param("from", "2026-10-01")
                        .param("to", "2026-10-01")
                        .param("timezone", "Asia/Ho_Chi_Minh")
                        .param("jobId", Long.toString(job)))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(jsonPath("$.applications").value(2))
                .andExpect(jsonPath("$.stageReachCounts.SUBMITTED").value(2))
                .andExpect(jsonPath("$.stageReachCounts.IN_REVIEW").value(2))
                .andExpect(jsonPath("$.stageReachCounts.SHORTLISTED").value(1))
                .andExpect(jsonPath("$.stageReachCounts.INTERVIEW").value(1))
                .andExpect(jsonPath("$.stageReachCounts.OFFERED").value(0))
                .andExpect(jsonPath("$.stageReachCounts.REJECTED").value(0))
                .andExpect(jsonPath("$.stageReachCounts.WITHDRAWN").value(0))
                .andExpect(jsonPath("$.bySource.PORTAL").value(1))
                .andExpect(jsonPath("$.bySource.REFERRAL").value(1));

        mvc.perform(get("/api/v1/recruiter/kpis")
                        .with(user(Long.toString(recruiter)).roles("RECRUITER"))
                        .param("from", "2026-10-01")
                        .param("to", "2026-10-01")
                        .param("timezone", "Asia/Ho_Chi_Minh")
                        .param("jobId", Long.toString(job))
                        .param("source", "portal"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.applications").value(1))
                .andExpect(jsonPath("$.stageReachCounts.SUBMITTED").value(1))
                .andExpect(jsonPath("$.stageReachCounts.IN_REVIEW").value(1))
                .andExpect(jsonPath("$.stageReachCounts.INTERVIEW").value(0))
                .andExpect(jsonPath("$.bySource.PORTAL").value(1))
                .andExpect(jsonPath("$.bySource.REFERRAL").doesNotExist());

        // Job khác có application không có history:
        // current status vẫn phải được tính.
        mvc.perform(get("/api/v1/recruiter/kpis")
                        .with(user(Long.toString(recruiter)).roles("RECRUITER"))
                        .param("from", "2026-10-01")
                        .param("to", "2026-10-01")
                        .param("timezone", "Asia/Ho_Chi_Minh")
                        .param("jobId", Long.toString(otherJob)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.applications").value(1))
                .andExpect(jsonPath("$.stageReachCounts.SUBMITTED").value(1))
                .andExpect(jsonPath("$.stageReachCounts.REJECTED").value(1))
                .andExpect(jsonPath("$.stageReachCounts.IN_REVIEW").value(0))
                .andExpect(jsonPath("$.bySource.UNKNOWN").value(1));
    }

    private void setApplication(
            long id, String createdAt, String source, String status
    ) {
        jdbc.update("""
                UPDATE job_applications
                SET created_at=?, source=?, status=?
                WHERE id=?
                """, LocalDateTime.parse(createdAt), source, status, id);
    }

    private void history(long applicationId, String stage) {
        jdbc.update("""
                INSERT INTO application_status_histories
                (version,created_at,updated_at,job_application_id,to_status)
                VALUES (0,NOW(),NOW(),?,?)
                """, applicationId, stage);
    }
}