-- V009: Harden schema integrity, remove dead audit schema, eliminate redundant prefix indexes,
-- convert critical timestamps to datetime(6) precision, and enforce foreign key invariants.

-- 1. Remove dead Envers tables (audit strategy uses separate audit_events / WORM ledger)
DROP TABLE IF EXISTS revchanges;
DROP TABLE IF EXISTS revinfo;

-- 2. Correct semantic check constraint on candidate_experiences
ALTER TABLE candidate_experiences
    DROP CHECK chk_candidate_experiences_dates_not_negative;

ALTER TABLE candidate_experiences
    ADD CONSTRAINT chk_candidate_experiences_dates_valid
    CHECK (start_date IS NOT NULL AND (end_date IS NULL OR end_date >= start_date));

-- 3. Drop redundant prefix indexes covered by composite unique / sorting indexes
ALTER TABLE application_status_histories
    DROP INDEX idx_application_status_histories_application_id;

ALTER TABLE candidate_skills
    DROP INDEX idx_candidate_skills_profile_id;

ALTER TABLE user_oauth_identities
    DROP INDEX idx_user_oauth_identities_user_id;

-- 4. Restore compound foreign key enforcing that job creator is a member of the job's company
ALTER TABLE jobs
    DROP FOREIGN KEY FK_JOBS_CREATED_BY_MEMBER_COMPANY;

ALTER TABLE jobs
    DROP COLUMN created_by_member_id;

ALTER TABLE jobs
    ADD CONSTRAINT fk_jobs_created_by_user_company
    FOREIGN KEY (company_id, created_by_user_id) REFERENCES company_members (company_id, user_id);

-- 5. Promote critical lifecycle and ordering timestamps to microsecond precision (datetime(6))
ALTER TABLE refresh_tokens
    MODIFY COLUMN expires_at datetime(6) NOT NULL,
    MODIFY COLUMN revoked_at datetime(6) NULL;

ALTER TABLE oauth_authorization_codes
    MODIFY COLUMN expires_at datetime(6) NOT NULL,
    MODIFY COLUMN consumed_at datetime(6) NULL;

ALTER TABLE password_reset_tokens
    MODIFY COLUMN expires_at datetime(6) NOT NULL,
    MODIFY COLUMN used_at datetime(6) NULL;

ALTER TABLE email_verification_tokens
    MODIFY COLUMN expires_at datetime(6) NOT NULL,
    MODIFY COLUMN consumed_at datetime(6) NULL;

ALTER TABLE application_screenings
    MODIFY COLUMN processing_lease_expires_at datetime(6) NULL,
    MODIFY COLUMN evaluated_at datetime(6) NULL;

ALTER TABLE application_status_histories
    MODIFY COLUMN created_at datetime(6) NOT NULL;

-- 6. Add database CHECK constraints for enum and format columns
ALTER TABLE job_applications
    ADD CONSTRAINT chk_job_applications_status
    CHECK (status IN ('SUBMITTED', 'IN_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED', 'WITHDRAWN'));

ALTER TABLE application_screenings
    ADD CONSTRAINT chk_application_screenings_status
    CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    ADD CONSTRAINT chk_application_screenings_recommendation
    CHECK (recommendation IS NULL OR recommendation IN ('RECOMMENDED', 'REVIEW', 'NOT_RECOMMENDED'));

ALTER TABLE jobs
    ADD CONSTRAINT chk_jobs_employment_type
    CHECK (employment_type IN ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE')),
    ADD CONSTRAINT chk_jobs_workplace_type
    CHECK (workplace_type IN ('ONSITE', 'HYBRID', 'REMOTE')),
    ADD CONSTRAINT chk_jobs_status
    CHECK (status IN ('DRAFT', 'OPEN', 'CLOSED', 'EXPIRED')),
    ADD CONSTRAINT chk_jobs_salary_currency
    CHECK (salary_currency IS NULL OR salary_currency REGEXP '^[A-Z]{3}$');

ALTER TABLE candidate_skills
    ADD CONSTRAINT chk_candidate_skills_proficiency
    CHECK (proficiency_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'));

ALTER TABLE company_members
    ADD CONSTRAINT chk_company_members_role
    CHECK (role IN ('OWNER', 'RECRUITER'));

ALTER TABLE user_oauth_identities
    ADD CONSTRAINT chk_user_oauth_identities_provider
    CHECK (provider IN ('GOOGLE'));
