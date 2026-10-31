package com.recruitment.app.modules.identity.application;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;

@Service
public class PlatformOverviewService {
    private final JdbcTemplate jdbc;
    public PlatformOverviewService(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    @Transactional(readOnly = true)
    public Map<String, Long> overview() {
        return Map.of("users", count("SELECT COUNT(*) FROM users"), "activeUsers", count("SELECT COUNT(*) FROM users WHERE is_active=1"),
                "openJobs", count("SELECT COUNT(*) FROM jobs WHERE status='OPEN'"), "applications", count("SELECT COUNT(*) FROM job_applications"),
                "completedScreenings", count("SELECT COUNT(*) FROM application_screenings WHERE status='COMPLETED'"),
                "failedScreenings", count("SELECT COUNT(*) FROM application_screenings WHERE status='FAILED'"));
    }
    private Long count(String sql) { return jdbc.queryForObject(sql, Long.class); }
}
