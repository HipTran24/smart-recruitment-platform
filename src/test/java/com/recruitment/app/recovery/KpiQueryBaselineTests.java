package com.recruitment.app.recovery;

import com.recruitment.app.modules.applications.application.KpiService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class KpiQueryBaselineTests extends RecoveryDatabaseTest {

    @Autowired
    KpiService kpis;

    @Test
    void measuresCurrentQueryAndRecordsExplain() {
        String prefix = "scrum80-" + UUID.randomUUID() + "-";
        long targetJob = job(createUser());
        long otherJob = job(createUser());

        List<Object[]> users = new ArrayList<>();
        for (int i = 0; i < 10000; i++) {
            users.add(new Object[]{prefix + i + "@example.test"});
        }

        jdbc.batchUpdate("""
                INSERT INTO users
                (version,created_at,updated_at,email,password_hash,full_name,is_active)
                VALUES(0,NOW(),NOW(),?,'test-only','Synthetic benchmark',1)
                """, users);

        jdbc.update("""
                INSERT INTO candidate_profiles
                (version,created_at,updated_at,user_id,ai_processing_consented)
                SELECT 0,NOW(),NOW(),id,0
                FROM users WHERE email LIKE ?
                """, prefix + "%");

        List<Long> profiles = jdbc.queryForList("""
                SELECT p.id FROM candidate_profiles p
                JOIN users u ON u.id=p.user_id
                WHERE u.email LIKE ? ORDER BY p.id
                """, Long.class, prefix + "%");

        assertEquals(10000, profiles.size());

        List<Object[]> applications = new ArrayList<>();
        for (int i = 0; i < profiles.size(); i++) {
            boolean selected = i < 100;
            applications.add(new Object[]{
                    selected ? targetJob : otherJob,
                    profiles.get(i),
                    selected ? "2026-01-01 12:00:00" : "2025-12-01 12:00:00",
                    selected ? "PORTAL" : "REFERRAL"
            });
        }

        jdbc.batchUpdate("""
                INSERT INTO job_applications
                (version,created_at,updated_at,job_id,candidate_profile_id,status,source)
                VALUES(0,?,NOW(),?,?,'SUBMITTED',?)
                """,
                applications.stream()
                        .map(row -> new Object[]{row[2], row[0], row[1], row[3]})
                        .toList());

        jdbc.update("""
                INSERT INTO application_status_histories
                (version,created_at,updated_at,job_application_id,to_status)
                SELECT 0,NOW(),NOW(),a.id,'IN_REVIEW'
                FROM job_applications a
                JOIN candidate_profiles p ON p.id=a.candidate_profile_id
                JOIN users u ON u.id=p.user_id
                WHERE u.email LIKE ?
                """, prefix + "%");

        // Reconstruct the aggregate SQL from the inspected JdbcKpiStore.
        // Keep this synchronized if production SQL changes.
        StringBuilder sql = new StringBuilder(
                "SELECT a.source, COUNT(DISTINCT a.id) AS total");
        String[] stages = {
                "IN_REVIEW", "SHORTLISTED", "INTERVIEW",
                "OFFERED", "REJECTED", "WITHDRAWN"
        };
        for (int i = 0; i < stages.length; i++) {
            sql.append(", COUNT(DISTINCT CASE WHEN a.status='")
                    .append(stages[i])
                    .append("' OR h.to_status='")
                    .append(stages[i])
                    .append("' THEN a.id END) AS stage_")
                    .append(i + 1);
        }
        sql.append("""
                 FROM job_applications a
                 LEFT JOIN application_status_histories h
                   ON h.job_application_id=a.id
                 WHERE a.created_at>=? AND a.created_at<?
                   AND a.job_id=? AND a.source=?
                 GROUP BY a.source
                """);

        String plan = jdbc.queryForObject(
                "EXPLAIN FORMAT=JSON " + sql,
                String.class,
                LocalDateTime.parse("2026-01-01T00:00:00"),
                LocalDateTime.parse("2026-01-02T00:00:00"),
                targetJob,
                "PORTAL"
        );
        assertNotNull(plan);
        System.out.println("SCRUM80_EXPLAIN_BEGIN");
        System.out.println(plan);
        System.out.println("SCRUM80_EXPLAIN_END");
        System.out.println("SCRUM80_ANALYZE_BEGIN");
          var actualPlan = jdbc.queryForList(
           "EXPLAIN ANALYZE " + sql,
             String.class,
            LocalDateTime.parse("2026-01-01T00:00:00"),
            LocalDateTime.parse("2026-01-02T00:00:00"),
           targetJob,
          "PORTAL"
);
actualPlan.forEach(System.out::println);
System.out.println("SCRUM80_ANALYZE_END");

        List<Double> samples = new ArrayList<>();
        for (int i = 0; i < 25; i++) {
            long start = System.nanoTime();
            var report = kpis.report(
                    "2026-01-01", "2026-01-01",
                    "UTC", targetJob, "PORTAL"
            );
            double elapsedMs = (System.nanoTime() - start) / 1_000_000.0;

            assertEquals(100, report.applications());
            assertEquals(Long.valueOf(100),
                    report.stageReachCounts().get("IN_REVIEW"));
            assertEquals(Long.valueOf(100), report.bySource().get("PORTAL"));

            if (i >= 5) {
                samples.add(elapsedMs);
            }
        }

        Collections.sort(samples);
        System.out.printf(
                Locale.ROOT,
                "SCRUM80_BASELINE applications=10000 histories=10000 " +
                "matched=100 warmup=5 samples=20 " +
                "p50_ms=%.3f p95_ms=%.3f%n",
                samples.get(9), samples.get(18)
        );
    }
}