package com.recruitment.app;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.*;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.sql.*;

import static org.junit.jupiter.api.Assertions.*;

@Testcontainers
class ApplicationSchemaConstraintTests {

    @Container
    static final MySQLContainer<?> MYSQL =
            new MySQLContainer<>(DockerImageName.parse("mysql:8.4.11"))
                    .withDatabaseName("scrum77_constraints")
                    .withUsername("scrum77_test")
                    .withPassword("synthetic-test-password");

    private Connection connection;

    @BeforeAll
    static void migrate() {
        Flyway.configure()
                .dataSource(
                        MYSQL.getJdbcUrl(),
                        MYSQL.getUsername(),
                        MYSQL.getPassword()
                )
                .locations("classpath:db/migration")
                .load()
                .migrate();
    }

    @BeforeEach
    void prepareFixture() throws Exception {
        connection = DriverManager.getConnection(
                MYSQL.getJdbcUrl(),
                MYSQL.getUsername(),
                MYSQL.getPassword()
        );
        connection.setAutoCommit(false);

        execute("""
                INSERT INTO users
                (id,version,created_at,updated_at,email,password_hash,full_name,is_active)
                VALUES
                (77001,0,NOW(),NOW(),'scrum77@example.test',
                 'test-only-not-a-login-hash','SCRUM77 Fixture',1)
                """);

        execute("""
                INSERT INTO companies
                (id,version,created_at,updated_at,name,slug,is_verified)
                VALUES (77001,0,NOW(),NOW(),'SCRUM77 Company','scrum77-company',1)
                """);

        execute("""
                INSERT INTO company_members
                (id,version,created_at,updated_at,company_id,user_id,role,is_active)
                VALUES (77001,0,NOW(),NOW(),77001,77001,'RECRUITER',1)
                """);

        execute("""
                INSERT INTO candidate_profiles
                (id,version,created_at,updated_at,user_id,ai_processing_consented)
                VALUES (77001,0,NOW(),NOW(),77001,0)
                """);

        execute("""
                INSERT INTO jobs
                (id,version,created_at,updated_at,company_id,created_by_user_id,
                 title,slug,description,employment_type,workplace_type,
                 salary_currency,status,headcount)
                VALUES
                (77001,0,NOW(),NOW(),77001,77001,'SCRUM77 Job','scrum77-job',
                 'Synthetic fixture','FULL_TIME','REMOTE','USD','DRAFT',1)
                """);

        execute("""
                INSERT INTO job_applications
                (id,version,created_at,updated_at,job_id,candidate_profile_id,status)
                VALUES (77001,0,NOW(),NOW(),77001,77001,'SUBMITTED')
                """);
    }

    @AfterEach
    void cleanup() throws Exception {
        if (connection != null) {
            try {
                connection.rollback();
            } finally {
                connection.close();
            }
        }
    }

    @Test
    void duplicateJobAndCandidateIsRejected() {
        assertDatabaseError(1062, """
                INSERT INTO job_applications
                (version,created_at,updated_at,job_id,candidate_profile_id,status)
                VALUES (0,NOW(),NOW(),77001,77001,'SUBMITTED')
                """);
    }

    @Test
    void applicationCannotReferenceMissingJob() {
        assertDatabaseError(1452, """
                INSERT INTO job_applications
                (version,created_at,updated_at,job_id,candidate_profile_id,status)
                VALUES (0,NOW(),NOW(),77999,77001,'SUBMITTED')
                """);
    }

    @Test
    void applicationRejectsUnknownStatus() {
        assertDatabaseError(3819, """
                UPDATE job_applications
                SET status='INVALID_STATUS'
                WHERE id=77001
                """);
    }

    @Test
    void historyCannotReferenceMissingApplication() {
        assertDatabaseError(1452, """
                INSERT INTO application_status_histories
                (version,created_at,updated_at,job_application_id,
                 from_status,to_status,changed_by_user_id,note)
                VALUES
                (0,NOW(),NOW(),77999,'SUBMITTED','IN_REVIEW',77001,'Synthetic')
                """);
    }

    @Test
    void validHistoryPersistsActorAndTimestamp() throws Exception {
        execute("""
                INSERT INTO application_status_histories
                (version,created_at,updated_at,job_application_id,
                 from_status,to_status,changed_by_user_id,note)
                VALUES
                (0,NOW(),NOW(),77001,'SUBMITTED','IN_REVIEW',77001,'QA review')
                """);

        try (Statement statement = connection.createStatement();
             ResultSet result = statement.executeQuery("""
                     SELECT from_status,to_status,changed_by_user_id,
                            note,created_at
                     FROM application_status_histories
                     WHERE job_application_id=77001
                     """)) {
            assertTrue(result.next());
            assertEquals("SUBMITTED", result.getString("from_status"));
            assertEquals("IN_REVIEW", result.getString("to_status"));
            assertEquals(77001L, result.getLong("changed_by_user_id"));
            assertEquals("QA review", result.getString("note"));
            assertNotNull(result.getTimestamp("created_at"));
            assertFalse(result.next());
        }
    }

    @Test
    void evaluationRejectsScoreOutsideRange() {
        assertDatabaseError(3819, evaluationSql(101));
        assertDatabaseError(3819, evaluationSql(-1));
    }

    @Test
    void evaluationCannotReferenceMissingEvaluator() {
        assertDatabaseError(1452, """
                INSERT INTO application_evaluations
                (created_at,updated_at,job_application_id,evaluator_user_id,
                 score,recommendation)
                VALUES (NOW(),NOW(),77001,77999,80,'YES')
                """);
    }

    @Test
    void multipleEvaluationsAndBoundaryScoresCanBeStored() throws Exception {
        execute(evaluationSql(0));
        execute(evaluationSql(100));

        try (Statement statement = connection.createStatement();
             ResultSet result = statement.executeQuery("""
                     SELECT COUNT(*) AS total, MIN(score) AS lowest,
                            MAX(score) AS highest
                     FROM application_evaluations
                     WHERE job_application_id=77001
                     """)) {
            assertTrue(result.next());
            assertEquals(2, result.getInt("total"));
            assertEquals(0, result.getInt("lowest"));
            assertEquals(100, result.getInt("highest"));
        }
    }

    private String evaluationSql(int score) {
        return """
                INSERT INTO application_evaluations
                (created_at,updated_at,job_application_id,evaluator_user_id,
                 score,recommendation)
                VALUES (NOW(),NOW(),77001,77001,%d,'YES')
                """.formatted(score);
    }

    private void assertDatabaseError(int expectedCode, String sql) {
        SQLException error = assertThrows(SQLException.class, () -> execute(sql));
        assertEquals(expectedCode, error.getErrorCode(), error.getMessage());
    }

    private void execute(String sql) throws SQLException {
        try (Statement statement = connection.createStatement()) {
            statement.executeUpdate(sql);
        }
    }
}