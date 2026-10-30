package com.recruitment.app.recovery;

import com.recruitment.app.modules.applications.application.KpiService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class KpiIntegrationTests extends RecoveryDatabaseTest {
    @Autowired KpiService kpis;

    @Test
    void filtersCohortWithLocalDayBoundariesJobAndSourceAndDeduplicatesHistory() throws Exception {
        long recruiter = createUser();
        long job = job(recruiter);
        long included = application(job, profile(createUser()));
        long excluded = application(job, profile(createUser()));
        jdbc.update("UPDATE job_applications SET created_at=?,source='PORTAL' WHERE id=?",
                java.time.LocalDateTime.parse("2026-10-29T17:00:00"), included);
        jdbc.update("UPDATE job_applications SET created_at=?,source='REFERRAL' WHERE id=?",
                java.time.LocalDateTime.parse("2026-10-30T17:00:00"), excluded);
        for (int i=0; i<2; i++) jdbc.update("""
                INSERT INTO application_status_histories(version,created_at,updated_at,job_application_id,to_status)
                VALUES(0,NOW(),NOW(),?,'IN_REVIEW')
                """, included);
        mvc.perform(get("/api/v1/recruiter/kpis").with(user(Long.toString(recruiter)).roles("RECRUITER"))
                        .param("from","2026-10-30").param("to","2026-10-30")
                        .param("timezone","Asia/Ho_Chi_Minh").param("jobId",Long.toString(job)).param("source","portal"))
                .andExpect(status().isOk()).andExpect(header().string("Cache-Control","no-store"))
                .andExpect(jsonPath("$.applications").value(1))
                .andExpect(jsonPath("$.stageReachCounts.SUBMITTED").value(1))
                .andExpect(jsonPath("$.stageReachCounts.IN_REVIEW").value(1))
                .andExpect(jsonPath("$.bySource.PORTAL").value(1));
        var empty = kpis.report("2026-10-30","2026-10-30","Asia/Ho_Chi_Minh",job,"REFERRAL");
        assertEquals(0,empty.applications());
        assertEquals(7,empty.stageReachCounts().size());
    }

    @Test
    void validatesFiltersAndRestrictsAggregateToRecruiters() throws Exception {
        for (String role : new String[]{"CANDIDATE","PLATFORM_ADMIN"}) {
            mvc.perform(get("/api/v1/recruiter/kpis").with(user("123").roles(role))
                    .param("from","2026-01-01").param("to","2026-01-02")).andExpect(status().isForbidden());
        }
        mvc.perform(get("/api/v1/recruiter/kpis").param("from","2026-01-01").param("to","2026-01-02"))
                .andExpect(status().isUnauthorized());
        for (String[] invalid : new String[][]{{"from","bad"},{"to","2025-01-01"},
                {"timezone","Mars/Unknown"},{"jobId","-1"},{"jobId","abc"},{"source","x';DROP"}}) {
            var request = get("/api/v1/recruiter/kpis").with(user("123").roles("RECRUITER"))
                    .param("from","2026-01-01").param("to","2026-01-02");
            request.param(invalid[0],invalid[1]);
            mvc.perform(request).andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("INVALID_KPI_FILTER"))
                    .andExpect(jsonPath("$.fieldErrors."+invalid[0]).exists());
        }
    }

    @Test
    void capturesExplicitAttributionWithoutInventingHistoricalSource() throws Exception {
        long candidate = createUser();
        long job = job(createUser());
        mvc.perform(post("/api/v1/jobs/"+job+"/applications").with(user(Long.toString(candidate)).roles("CANDIDATE")).with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                .contentType("application/json").content("{\"source\":\"referral\"}"))
                .andExpect(status().isCreated());
        assertEquals("REFERRAL",jdbc.queryForObject("SELECT source FROM job_applications WHERE job_id=?",String.class,job));
        long historical = application(job,profile(createUser()));
        assertEquals("UNKNOWN",jdbc.queryForObject("SELECT source FROM job_applications WHERE id=?",String.class,historical));
    }

    @Test
    void syntheticTenThousandApplicationBenchmarkReportsMeasuredLatency() {
        String prefix = "kpi-benchmark-"+UUID.randomUUID();
        long job = job(createUser());
        List<Object[]> users = new ArrayList<>();
        for (int i=0;i<10000;i++) users.add(new Object[]{prefix+i+"@example.test"});
        jdbc.batchUpdate("""
                INSERT INTO users(version,created_at,updated_at,email,password_hash,full_name,is_active)
                VALUES(0,NOW(),NOW(),?,'test-only','Synthetic benchmark',1)
                """,users);
        jdbc.update("""
                INSERT INTO candidate_profiles(version,created_at,updated_at,user_id,ai_processing_consented)
                SELECT 0,NOW(),NOW(),id,0 FROM users WHERE email LIKE ?
                """,prefix+"%");
        jdbc.update("""
                INSERT INTO job_applications(version,created_at,updated_at,job_id,candidate_profile_id,status,source)
                SELECT 0,'2026-01-01','2026-01-01',?,p.id,'SUBMITTED','PORTAL'
                FROM candidate_profiles p JOIN users u ON p.user_id=u.id WHERE u.email LIKE ?
                """,job,prefix+"%");
        jdbc.update("""
                INSERT INTO application_status_histories(version,created_at,updated_at,job_application_id,to_status)
                SELECT 0,NOW(),NOW(),id,'IN_REVIEW' FROM job_applications WHERE job_id=?
                """,job);
        List<Double> samples = new ArrayList<>();
        for(int i=0;i<25;i++) {
            long start = System.nanoTime();
            var report = kpis.report("2026-01-01","2026-01-01","UTC",job,"PORTAL");
            double elapsed=(System.nanoTime()-start)/1_000_000.0;
            assertEquals(10000,report.applications());
            assertEquals(10000,report.stageReachCounts().get("IN_REVIEW"));
            if(i>=5) samples.add(elapsed);
        }
        Collections.sort(samples);
        System.out.printf(Locale.ROOT,"KPI_BENCHMARK rows=10000 histories=10000 warmup=5 samples=20 p50_ms=%.3f p95_ms=%.3f%n",
                samples.get(9),samples.get(18));
    }
}
