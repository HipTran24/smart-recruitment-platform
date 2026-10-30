package com.recruitment.app.recovery;

import com.recruitment.app.ApplicationTests;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@org.springframework.transaction.annotation.Transactional
public abstract class RecoveryDatabaseTest {
    @Autowired protected MockMvc mvc;
    @Autowired protected JdbcTemplate jdbc;
    @jakarta.persistence.PersistenceContext protected jakarta.persistence.EntityManager entityManager;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        if (!ApplicationTests.MYSQL.isRunning()) ApplicationTests.MYSQL.start();
        registry.add("spring.datasource.url", ApplicationTests.MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", ApplicationTests.MYSQL::getUsername);
        registry.add("spring.datasource.password", ApplicationTests.MYSQL::getPassword);
    }

    protected long createUser() {
        jdbc.update("""
                INSERT INTO users(version,created_at,updated_at,email,password_hash,full_name,is_active)
                VALUES(0,NOW(),NOW(),?,'test-only-not-a-password-hash','Synthetic fixture',1)
                """, java.util.UUID.randomUUID() + "@example.test");
        return lastId();
    }

    protected long profile(long user) {
        jdbc.update("""
                INSERT INTO candidate_profiles(version,created_at,updated_at,user_id,ai_processing_consented)
                VALUES(0,NOW(),NOW(),?,0)
                """, user);
        return lastId();
    }

    protected long job(long recruiter) {
        jdbc.update("""
                INSERT INTO companies(version,created_at,updated_at,name,slug,is_verified)
                VALUES(0,NOW(),NOW(),'Synthetic company',?,0)
                """, java.util.UUID.randomUUID().toString());
        long company = lastId();
        jdbc.update("""
                INSERT INTO company_members(version,created_at,updated_at,company_id,user_id,role,is_active)
                VALUES(0,NOW(),NOW(),?,?,'OWNER',1)
                """, company, recruiter);
        jdbc.update("""
                INSERT INTO jobs(version,created_at,updated_at,company_id,created_by_user_id,title,slug,
                description,employment_type,workplace_type,salary_currency,status,headcount)
                VALUES(0,NOW(),NOW(),?,?,'Synthetic job',?,'Fixture','FULL_TIME','REMOTE','VND','OPEN',1)
                """, company, recruiter, java.util.UUID.randomUUID().toString());
        return lastId();
    }

    protected long application(long job, long profile) {
        jdbc.update("""
                INSERT INTO job_applications(version,created_at,updated_at,job_id,candidate_profile_id,status)
                VALUES(0,NOW(),NOW(),?,?,'SUBMITTED')
                """, job, profile);
        return lastId();
    }

    protected long offer(long application, long candidate, long recruiter) {
        jdbc.update("""
                INSERT INTO job_offers(version,created_at,updated_at,job_application_id,candidate_user_id,
                created_by_user_id,salary_offered,start_date,deadline,status)
                VALUES(0,NOW(),NOW(),?,?,?,100,CURRENT_DATE()+INTERVAL 14 DAY,NOW()+INTERVAL 7 DAY,'SENT')
                """, application, candidate, recruiter);
        return lastId();
    }

    protected long lastId() {
        return jdbc.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
    }
}
