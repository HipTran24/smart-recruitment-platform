package com.recruitment.app.modules.applications.application;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component("recruiterAccess")
public class RecruiterAccess {
    private final JdbcTemplate jdbc;
    public RecruiterAccess(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    public boolean application(String user, Long id) { return allowed(user, id, "job_applications", "id"); }
    public boolean interview(String user, Long id) { return allowed(user, id, "interviews", "job_application_id"); }
    public boolean offer(String user, Long id) { return allowed(user, id, "job_offers", "job_application_id"); }
    public boolean feedback(String user, Long id) { return allowed(user, id, "feedback_drafts", "job_application_id"); }
    private boolean allowed(String user, Long id, String table, String applicationKey) {
        if (id == null) return false;
        String join = table.equals("job_applications") ? "" : " JOIN job_applications a ON a.id=t." + applicationKey;
        String alias = table.equals("job_applications") ? "t" : "a";
        Long count = jdbc.queryForObject("SELECT COUNT(*) FROM " + table + " t" + join + " JOIN jobs j ON j.id=" + alias
                + ".job_id WHERE t.id=? AND EXISTS(SELECT 1 FROM company_members m WHERE m.company_id=j.company_id AND m.user_id=? AND m.is_active=1)", Long.class, id, Long.parseLong(user));
        return count != null && count > 0;
    }
}
