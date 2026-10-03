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
    }
}
