package com.recruitment.app.modules.applications.infrastructure.persistence.repository;

import com.recruitment.app.modules.applications.domain.model.ApplicationSnapshot;
import com.recruitment.app.modules.applications.domain.model.ApplicationSnapshot.StatusHistorySnapshot;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.*;

/** Two bounded queries per list, rather than separate job/user/history/screening reads per row. */
@Component
public class ApplicationListReader {
    private final JdbcTemplate jdbc;
    public ApplicationListReader(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    public List<ApplicationSnapshot> recruiter(Long user, Long job, String status, int page, int size) {
        var args = new ArrayList<Object>(); args.add(user);
        String where = recruiterWhere(job, status, args);
        args.add(size); args.add((long) page * size);
        return read(where + " ORDER BY a.created_at DESC,a.id DESC LIMIT ? OFFSET ?", args);
    }
    public long count(Long user, Long job, String status) {
        var args = new ArrayList<Object>(); args.add(user);
        String where = recruiterWhere(job, status, args);
        return Objects.requireNonNull(jdbc.queryForObject("SELECT COUNT(*) FROM job_applications a JOIN jobs j ON j.id=a.job_id " + where, Long.class, args.toArray()));
    }
    public List<ApplicationSnapshot> candidate(Long profile) {
        return read("WHERE a.candidate_profile_id=? ORDER BY a.created_at DESC,a.id DESC", List.of(profile));
    }
    private String recruiterWhere(Long job, String status, List<Object> args) {
        String where = "WHERE EXISTS (SELECT 1 FROM company_members m WHERE m.company_id=j.company_id AND m.user_id=? AND m.is_active=1)";
        if (job != null) { where += " AND a.job_id=?"; args.add(job); }
        if (status != null && !status.isBlank()) { where += " AND a.status=?"; args.add(status); }
        return where;
    }
    private List<ApplicationSnapshot> read(String where, List<?> args) {
        var histories = new HashMap<Long, List<StatusHistorySnapshot>>();
        RowMapper<ApplicationSnapshot> mapper = (rs, n) -> new ApplicationSnapshot(rs.getLong("id"), rs.getLong("job_id"),
                rs.getString("job_title"), rs.getLong("candidate_profile_id"), rs.getString("full_name"), rs.getString("email"),
                rs.getObject("candidate_resume_id", Long.class), rs.getString("status"), rs.getString("cover_letter"),
                instant(rs, "withdrawn_at"), instant(rs, "created_at"), rs.getObject("score", Integer.class),
                rs.getString("recommendation"), rs.getString("summary"), rs.getString("matched_criteria"), rs.getString("missing_criteria"),
                histories.computeIfAbsent(rs.getLong("id"), id -> new ArrayList<>()));
        var applications = jdbc.query("""
                SELECT a.*,j.title AS job_title,u.full_name,u.email,s.score,s.recommendation,s.summary,s.matched_criteria,s.missing_criteria
                FROM job_applications a JOIN jobs j ON j.id=a.job_id
                JOIN candidate_profiles cp ON cp.id=a.candidate_profile_id JOIN users u ON u.id=cp.user_id
                LEFT JOIN application_screenings s ON s.id=(SELECT x.id FROM application_screenings x
                  WHERE x.job_application_id=a.id ORDER BY x.attempt DESC LIMIT 1)
                """ + where, mapper, args.toArray());
        if (applications.isEmpty()) return applications;
        String placeholders = String.join(",", Collections.nCopies(applications.size(), "?"));
        jdbc.query("SELECT * FROM application_status_histories WHERE job_application_id IN (" + placeholders + ") ORDER BY created_at,id", rs -> {
            histories.get(rs.getLong("job_application_id")).add(new StatusHistorySnapshot(rs.getLong("id"), rs.getString("from_status"),
                    rs.getString("to_status"), rs.getObject("changed_by_user_id", Long.class), rs.getString("note"), instant(rs, "created_at")));
        }, applications.stream().map(ApplicationSnapshot::id).toArray());
        return applications;
    }
    private static Instant instant(ResultSet rs, String name) throws SQLException {
        var timestamp = rs.getTimestamp(name);
        return timestamp == null ? null : timestamp.toInstant();
    }
}
