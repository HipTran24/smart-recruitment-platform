package com.recruitment.app;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SchemaMigrationUpgradeTests {

    @BeforeAll
    static void ensureContainer() {
        if (!ApplicationTests.MYSQL.isRunning()) {
            ApplicationTests.MYSQL.start();
        }
    }

    @Test
    void verifiesEmptyDatabaseMigrationUpToLatest() throws Exception {
        String dbName = "empty_upgrade_test";
        String rootUrl = ApplicationTests.MYSQL.getJdbcUrl().replaceAll("/[^/]+$", "/") + "?allowPublicKeyRetrieval=true&useSSL=false";
        try (Connection rootConn = DriverManager.getConnection(rootUrl, "root", ApplicationTests.MYSQL.getPassword());
             Statement stmt = rootConn.createStatement()) {
            stmt.execute("DROP DATABASE IF EXISTS " + dbName);
            stmt.execute("CREATE DATABASE " + dbName);
        }

        String jdbcUrl = ApplicationTests.MYSQL.getJdbcUrl().replaceAll("/[^/]+$", "/" + dbName) + "?allowPublicKeyRetrieval=true&useSSL=false";
        Flyway flyway = Flyway.configure()
                .dataSource(jdbcUrl, "root", ApplicationTests.MYSQL.getPassword())
                .locations("classpath:db/migration")
                .cleanDisabled(false)
                .load();

        var result = flyway.migrate();
        assertTrue(result.migrationsExecuted >= 9, "All migrations through V009 must execute on an empty database");
        assertEquals("009", flyway.info().current().getVersion().getVersion());

        try (Connection conn = DriverManager.getConnection(jdbcUrl, "root", ApplicationTests.MYSQL.getPassword());
             Statement stmt = conn.createStatement()) {
            try (ResultSet rs = stmt.executeQuery("SELECT count(*) FROM roles WHERE code IN ('ROLE_RECRUITER', 'ROLE_PLATFORM_ADMIN')")) {
                assertTrue(rs.next());
                assertEquals(2, rs.getInt(1));
            }
        }
    }

    @Test
    void verifiesUpgradeFromV006ToV007WithDataBackfill() throws Exception {
        String dbName = "v006_upgrade_test";
        String rootUrl = ApplicationTests.MYSQL.getJdbcUrl().replaceAll("/[^/]+$", "/") + "?allowPublicKeyRetrieval=true&useSSL=false";
        try (Connection rootConn = DriverManager.getConnection(rootUrl, "root", ApplicationTests.MYSQL.getPassword());
             Statement stmt = rootConn.createStatement()) {
            stmt.execute("DROP DATABASE IF EXISTS " + dbName);
            stmt.execute("CREATE DATABASE " + dbName);
        }

        String jdbcUrl = ApplicationTests.MYSQL.getJdbcUrl().replaceAll("/[^/]+$", "/" + dbName) + "?allowPublicKeyRetrieval=true&useSSL=false";

        // Step 1: Migrate up to V006
        Flyway flywayV6 = Flyway.configure()
                .dataSource(jdbcUrl, "root", ApplicationTests.MYSQL.getPassword())
                .locations("classpath:db/migration")
                .target("006")
                .cleanDisabled(false)
                .load();
        flywayV6.migrate();
        assertEquals("006", flywayV6.info().current().getVersion().getVersion());

        // Step 2: Seed synthetic user, company, company_member and job under V006
        long userId = 1001L;
        long companyId = 2001L;
        long memberId = 3001L;
        long jobId = 4001L;

        try (Connection conn = DriverManager.getConnection(jdbcUrl, "root", ApplicationTests.MYSQL.getPassword())) {
            try (PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO users (id, version, created_at, updated_at, email, password_hash, full_name, is_active) " +
                            "VALUES (?, 0, NOW(), NOW(), 'recruiter@test.org', 'hash', 'Recruiter Tester', 1)")) {
                ps.setLong(1, userId);
                ps.executeUpdate();
            }

            try (PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO companies (id, version, created_at, updated_at, name, slug, is_verified) " +
                            "VALUES (?, 0, NOW(), NOW(), 'Test Corp', 'test-corp', 1)")) {
                ps.setLong(1, companyId);
                ps.executeUpdate();
            }

            try (PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO company_members (id, version, created_at, updated_at, company_id, user_id, role, is_active) " +
                            "VALUES (?, 0, NOW(), NOW(), ?, ?, 'RECRUITER', 1)")) {
                ps.setLong(1, memberId);
                ps.setLong(2, companyId);
                ps.setLong(3, userId);
                ps.executeUpdate();
            }

            try (PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO jobs (id, version, created_at, updated_at, company_id, created_by_member_id, title, slug, description, employment_type, workplace_type, salary_currency, status, headcount) " +
                            "VALUES (?, 0, NOW(), NOW(), ?, ?, 'Lead Dev', 'lead-dev', 'Desc', 'FULL_TIME', 'REMOTE', 'USD', 'DRAFT', 1)")) {
                ps.setLong(1, jobId);
                ps.setLong(2, companyId);
                ps.setLong(3, memberId);
                ps.executeUpdate();
            }
        }

        // Step 3: Migrate to V007
        Flyway flywayV7 = Flyway.configure()
                .dataSource(jdbcUrl, "root", ApplicationTests.MYSQL.getPassword())
                .locations("classpath:db/migration")
                .target("007")
                .cleanDisabled(false)
                .load();
        flywayV7.migrate();
        assertEquals("007", flywayV7.info().current().getVersion().getVersion());

        // Step 4: Verify backfill of created_by_user_id from company_members.user_id
        try (Connection conn = DriverManager.getConnection(jdbcUrl, "root", ApplicationTests.MYSQL.getPassword());
             PreparedStatement ps = conn.prepareStatement("SELECT created_by_user_id FROM jobs WHERE id = ?")) {
            ps.setLong(1, jobId);
            try (ResultSet rs = ps.executeQuery()) {
                assertTrue(rs.next(), "Job row must exist after migration");
                assertEquals(userId, rs.getLong("created_by_user_id"),
                        "created_by_user_id must be backfilled from company_members.user_id");
            }
        }

        // Step 5: Migrate to V008 and verify credential_version default
        Flyway flywayV8 = Flyway.configure()
                .dataSource(jdbcUrl, "root", ApplicationTests.MYSQL.getPassword())
                .locations("classpath:db/migration")
                .target("008")
                .cleanDisabled(false)
                .load();
        flywayV8.migrate();
        assertEquals("008", flywayV8.info().current().getVersion().getVersion());

        try (Connection conn = DriverManager.getConnection(jdbcUrl, "root", ApplicationTests.MYSQL.getPassword());
             PreparedStatement ps = conn.prepareStatement("SELECT credential_version, email_verified FROM users WHERE id = ?")) {
            ps.setLong(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                assertTrue(rs.next(), "User row must exist after migration");
                assertEquals(1, rs.getInt("credential_version"));
                assertEquals(0, rs.getInt("email_verified"));
            }
        }

        // Step 6: Seed mismatched jobs under V008 (Scenario A: creator outside company; Scenario B: company with 0 members)
        long outsideUserId = 1002L;
        long secondCompanyId = 2002L;
        long mismatchedJobId = 4002L;
        long zeroMemberCompanyId = 2003L;
        long zeroMemberJobId = 4003L;
        try (Connection conn = DriverManager.getConnection(jdbcUrl, "root", ApplicationTests.MYSQL.getPassword())) {
            try (PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO users (id, version, created_at, updated_at, email, password_hash, full_name, is_active) VALUES (?, 0, NOW(), NOW(), 'outside@example.com', 'hash', 'Outside User', 1)")) {
                ps.setLong(1, outsideUserId);
                ps.executeUpdate();
            }
            try (PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO companies (id, version, created_at, updated_at, name, slug, is_verified) VALUES (?, 0, NOW(), NOW(), 'Company Two', 'company-two', 1)")) {
                ps.setLong(1, secondCompanyId);
                ps.executeUpdate();
            }
            try (PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO company_members (id, version, created_at, updated_at, company_id, user_id, role, is_active) VALUES (3002, 0, NOW(), NOW(), ?, ?, 'OWNER', 1)")) {
                ps.setLong(1, secondCompanyId);
                ps.setLong(2, outsideUserId);
                ps.executeUpdate();
            }
            // Scenario A: Insert job under companyId (2001), but with created_by_user_id = outsideUserId (1002)
            try (PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO jobs (id, version, created_at, updated_at, company_id, created_by_user_id, created_by_member_id, title, slug, description, employment_type, workplace_type, salary_currency, status, headcount) VALUES (?, 0, NOW(), NOW(), ?, ?, NULL, 'Mismatched Job', 'mismatched-job', 'Desc', 'FULL_TIME', 'REMOTE', 'USD', 'DRAFT', 1)")) {
                ps.setLong(1, mismatchedJobId);
                ps.setLong(2, companyId);
                ps.setLong(3, outsideUserId);
                ps.executeUpdate();
            }
            // Scenario B: Insert company 2003 with ZERO members in company_members, and a job created by outsideUserId
            try (PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO companies (id, version, created_at, updated_at, name, slug, is_verified) VALUES (?, 0, NOW(), NOW(), 'Company Three', 'company-three', 1)")) {
                ps.setLong(1, zeroMemberCompanyId);
                ps.executeUpdate();
            }
            try (PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO jobs (id, version, created_at, updated_at, company_id, created_by_user_id, created_by_member_id, title, slug, description, employment_type, workplace_type, salary_currency, status, headcount) VALUES (?, 0, NOW(), NOW(), ?, ?, NULL, 'Zero Member Job', 'zero-member-job', 'Desc', 'FULL_TIME', 'REMOTE', 'USD', 'DRAFT', 1)")) {
                ps.setLong(1, zeroMemberJobId);
                ps.setLong(2, zeroMemberCompanyId);
                ps.setLong(3, outsideUserId);
                ps.executeUpdate();
            }
        }

        Flyway flywayV9 = Flyway.configure()
                .dataSource(jdbcUrl, "root", ApplicationTests.MYSQL.getPassword())
                .locations("classpath:db/migration")
                .target("009")
                .cleanDisabled(false)
                .load();
        flywayV9.migrate();
        assertEquals("009", flywayV9.info().current().getVersion().getVersion());

        try (Connection conn = DriverManager.getConnection(jdbcUrl, "root", ApplicationTests.MYSQL.getPassword())) {
            // Scenario A check: Mismatched job's creator was backfilled to company's member (userId)
            try (PreparedStatement ps = conn.prepareStatement("SELECT created_by_user_id FROM jobs WHERE id = ?")) {
                ps.setLong(1, mismatchedJobId);
                try (ResultSet rs = ps.executeQuery()) {
                    assertTrue(rs.next(), "Mismatched job must still exist after V009");
                    assertEquals(userId, rs.getLong("created_by_user_id"),
                            "Mismatched created_by_user_id must be backfilled to valid company member");
                }
            }
            // Scenario B check: Zero-member company had OWNER membership synthesized for outsideUserId
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT role FROM company_members WHERE company_id = ? AND user_id = ?")) {
                ps.setLong(1, zeroMemberCompanyId);
                ps.setLong(2, outsideUserId);
                try (ResultSet rs = ps.executeQuery()) {
                    assertTrue(rs.next(), "Synthesized membership must exist for zero-member company");
                    assertEquals("OWNER", rs.getString("role"));
                }
            }
            try (PreparedStatement ps = conn.prepareStatement("SELECT created_by_user_id FROM jobs WHERE id = ?")) {
                ps.setLong(1, zeroMemberJobId);
                try (ResultSet rs = ps.executeQuery()) {
                    assertTrue(rs.next(), "Job in zero-member company must still exist");
                    assertEquals(outsideUserId, rs.getLong("created_by_user_id"));
                }
            }
            // Zero orphaned creators remain across entire jobs table
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT COUNT(*) AS orphans FROM jobs j WHERE NOT EXISTS (SELECT 1 FROM company_members m WHERE m.company_id = j.company_id AND m.user_id = j.created_by_user_id)")) {
                try (ResultSet rs = ps.executeQuery()) {
                    assertTrue(rs.next());
                    assertEquals(0L, rs.getLong("orphans"), "No orphaned job creators may exist in V009");
                }
            }
        }
    }
}
