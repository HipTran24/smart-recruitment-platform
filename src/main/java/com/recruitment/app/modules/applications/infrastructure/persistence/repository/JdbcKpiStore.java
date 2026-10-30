package com.recruitment.app.modules.applications.infrastructure.persistence.repository;

import com.recruitment.app.modules.applications.application.port.out.KpiStore;
import com.recruitment.app.modules.applications.domain.model.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.Instant;
import java.util.*;

@Repository
public class JdbcKpiStore implements KpiStore {
    private static final List<String> STAGES = List.of("SUBMITTED", "IN_REVIEW", "SHORTLISTED", "INTERVIEW", "OFFERED", "REJECTED", "WITHDRAWN");
    private final JdbcTemplate jdbc;
    public JdbcKpiStore(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Override
    public boolean jobExists(long id) {
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM jobs WHERE id=?)", Boolean.class, id));
    }

    @Override
    public KpiReport aggregate(KpiQuery query) {
        StringBuilder sql = new StringBuilder("SELECT a.source, COUNT(DISTINCT a.id) AS total");
        for (int i = 1; i < STAGES.size(); i++) {
            sql.append(", COUNT(DISTINCT CASE WHEN a.status='").append(STAGES.get(i))
                    .append("' OR h.to_status='").append(STAGES.get(i)).append("' THEN a.id END) AS stage_").append(i);
        }
        sql.append(" FROM job_applications a LEFT JOIN application_status_histories h ON h.job_application_id=a.id")
                .append(" WHERE a.created_at>=? AND a.created_at<?");
        List<Object> args = new ArrayList<>(List.of(LocalDateTime.ofInstant(query.startInclusive(), ZoneOffset.UTC), LocalDateTime.ofInstant(query.endExclusive(), ZoneOffset.UTC)));
        if (query.jobId() != null) { sql.append(" AND a.job_id=?"); args.add(query.jobId()); }
        if (query.source() != null) { sql.append(" AND a.source=?"); args.add(query.source()); }
        sql.append(" GROUP BY a.source");
        Map<String, Long> stages = new LinkedHashMap<>();
        STAGES.forEach(stage -> stages.put(stage, 0L));
        Map<String, Long> sources = new TreeMap<>();
        jdbc.query(sql.toString(), rs -> {
            long total = rs.getLong("total");
            sources.put(rs.getString("source"), total);
            stages.compute("SUBMITTED", (k,v) -> v + total);
            for (int i = 1; i < STAGES.size(); i++) {
                stages.merge(STAGES.get(i), rs.getLong("stage_" + i), Long::sum);
            }
        }, args.toArray());
        return new KpiReport(query, Instant.now(), stages.get("SUBMITTED"), Map.copyOf(stages), Map.copyOf(sources));
    }
}
