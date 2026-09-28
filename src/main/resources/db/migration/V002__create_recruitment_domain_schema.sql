CREATE TABLE application_screenings
(
    id                 BIGINT AUTO_INCREMENT NOT NULL,
    version            BIGINT                NOT NULL,
    created_at         datetime              NOT NULL,
    updated_at         datetime              NOT NULL,
    job_application_id BIGINT                NOT NULL,
    status             VARCHAR(20)           NOT NULL,
    score              INT                   NULL,
    recommendation     VARCHAR(30)           NULL,
    summary            TEXT                  NULL,
    matched_criteria   TEXT                  NULL,
    missing_criteria   TEXT                  NULL,
    provider           VARCHAR(100)          NOT NULL,
    model_version      VARCHAR(100)          NOT NULL,
    prompt_version     VARCHAR(100)          NOT NULL,
    input_hash         VARCHAR(64)           NOT NULL,
    attempt            INT                   NOT NULL,
    evaluated_at       datetime              NULL,
    error_message      TEXT                  NULL,
    CONSTRAINT pk_application_screenings PRIMARY KEY (id)
);

CREATE TABLE application_status_histories
(
    id                 BIGINT AUTO_INCREMENT NOT NULL,
    version            BIGINT                NOT NULL,
    created_at         datetime              NOT NULL,
    updated_at         datetime              NOT NULL,
    job_application_id BIGINT                NOT NULL,
    from_status        VARCHAR(20)           NULL,
    to_status          VARCHAR(20)           NOT NULL,
    changed_by_user_id BIGINT                NULL,
    note               TEXT                  NULL,
    CONSTRAINT pk_application_status_histories PRIMARY KEY (id)
);

CREATE TABLE candidate_educations
(
    id                   BIGINT AUTO_INCREMENT NOT NULL,
    version              BIGINT                NOT NULL,
    created_at           datetime              NOT NULL,
    updated_at           datetime              NOT NULL,
    candidate_profile_id BIGINT                NOT NULL,
    institution_name     VARCHAR(200)          NOT NULL,
    degree               VARCHAR(120)          NULL,
    field_of_study       VARCHAR(150)          NULL,
    start_date           date                  NULL,
    end_date             date                  NULL,
    `description`        TEXT                  NULL,
    CONSTRAINT pk_candidate_educations PRIMARY KEY (id)
);

CREATE TABLE candidate_experiences
(
    id                   BIGINT AUTO_INCREMENT NOT NULL,
    version              BIGINT                NOT NULL,
    created_at           datetime              NOT NULL,
    updated_at           datetime              NOT NULL,
    candidate_profile_id BIGINT                NOT NULL,
    company_name         VARCHAR(200)          NOT NULL,
    job_title            VARCHAR(150)          NOT NULL,
    employment_type      VARCHAR(30)           NOT NULL,
    start_date           date                  NOT NULL,
    end_date             date                  NULL,
    `description`        TEXT                  NULL,
    CONSTRAINT pk_candidate_experiences PRIMARY KEY (id)
);

CREATE TABLE candidate_profiles
(
    id         BIGINT AUTO_INCREMENT NOT NULL,
    version    BIGINT                NOT NULL,
    created_at datetime              NOT NULL,
    updated_at datetime              NOT NULL,
    user_id    BIGINT                NOT NULL,
    phone      VARCHAR(30)           NULL,
    headline   VARCHAR(150)          NULL,
    city       VARCHAR(100)          NULL,
    bio        TEXT                  NULL,
    CONSTRAINT pk_candidate_profiles PRIMARY KEY (id)
);

CREATE TABLE candidate_resumes
(
    id                   BIGINT AUTO_INCREMENT NOT NULL,
    version              BIGINT                NOT NULL,
    created_at           datetime              NOT NULL,
    updated_at           datetime              NOT NULL,
    candidate_profile_id BIGINT                NOT NULL,
    original_file_name   VARCHAR(255)          NOT NULL,
    storage_key          VARCHAR(500)          NOT NULL,
    content_type         VARCHAR(100)          NOT NULL,
    file_size_bytes      BIGINT                NOT NULL,
    is_primary           BIT(1)                NOT NULL,
    primary_profile_id   BIGINT GENERATED ALWAYS AS (
        CASE WHEN is_primary = b'1' THEN candidate_profile_id ELSE NULL END
    ) STORED,
    CONSTRAINT pk_candidate_resumes PRIMARY KEY (id)
);

CREATE TABLE candidate_skills
(
    id                   BIGINT AUTO_INCREMENT NOT NULL,
    version              BIGINT                NOT NULL,
    created_at           datetime              NOT NULL,
    updated_at           datetime              NOT NULL,
    candidate_profile_id BIGINT                NOT NULL,
    skill_id             BIGINT                NOT NULL,
    proficiency_level    VARCHAR(20)           NOT NULL,
    years_of_experience  INT                   NULL,
    CONSTRAINT pk_candidate_skills PRIMARY KEY (id)
);

CREATE TABLE companies
(
    id            BIGINT AUTO_INCREMENT NOT NULL,
    version       BIGINT                NOT NULL,
    created_at    datetime              NOT NULL,
    updated_at    datetime              NOT NULL,
    name          VARCHAR(200)          NOT NULL,
    slug          VARCHAR(160)          NOT NULL,
    `description` TEXT                  NULL,
    website       VARCHAR(255)          NULL,
    logo_url      VARCHAR(500)          NULL,
    industry      VARCHAR(100)          NULL,
    company_size  VARCHAR(50)           NULL,
    location      VARCHAR(150)          NULL,
    is_verified   BIT(1)                NOT NULL,
    CONSTRAINT pk_companies PRIMARY KEY (id)
);

CREATE TABLE company_members
(
    id         BIGINT AUTO_INCREMENT NOT NULL,
    version    BIGINT                NOT NULL,
    created_at datetime              NOT NULL,
    updated_at datetime              NOT NULL,
    company_id BIGINT                NOT NULL,
    user_id    BIGINT                NOT NULL,
    `role`     VARCHAR(20)           NOT NULL,
    is_active  BIT(1)                NOT NULL,
    CONSTRAINT pk_company_members PRIMARY KEY (id)
);

CREATE TABLE job_applications
(
    id                   BIGINT AUTO_INCREMENT NOT NULL,
    version              BIGINT                NOT NULL,
    created_at           datetime              NOT NULL,
    updated_at           datetime              NOT NULL,
    job_id               BIGINT                NOT NULL,
    candidate_profile_id BIGINT                NOT NULL,
    candidate_resume_id  BIGINT                NULL,
    status               VARCHAR(20)           NOT NULL,
    cover_letter         TEXT                  NULL,
    withdrawn_at         datetime              NULL,
    CONSTRAINT pk_job_applications PRIMARY KEY (id)
);

CREATE TABLE job_skills
(
    id            BIGINT AUTO_INCREMENT NOT NULL,
    version       BIGINT                NOT NULL,
    created_at    datetime              NOT NULL,
    updated_at    datetime              NOT NULL,
    job_id        BIGINT                NOT NULL,
    skill_id      BIGINT                NOT NULL,
    is_required   BIT(1)                NOT NULL,
    minimum_years INT                   NULL,
    CONSTRAINT pk_job_skills PRIMARY KEY (id)
);

CREATE TABLE jobs
(
    id                   BIGINT AUTO_INCREMENT NOT NULL,
    version              BIGINT                NOT NULL,
    created_at           datetime              NOT NULL,
    updated_at           datetime              NOT NULL,
    company_id           BIGINT                NOT NULL,
    created_by_member_id BIGINT                NOT NULL,
    title                VARCHAR(200)          NOT NULL,
    slug                 VARCHAR(200)          NOT NULL,
    `description`        TEXT                  NOT NULL,
    requirements         TEXT                  NULL,
    employment_type      VARCHAR(30)           NOT NULL,
    workplace_type       VARCHAR(20)           NOT NULL,
    location             VARCHAR(150)          NULL,
    salary_min           DECIMAL(15, 2)        NULL,
    salary_max           DECIMAL(15, 2)        NULL,
    salary_currency      VARCHAR(3)            NOT NULL,
    status               VARCHAR(20)           NOT NULL,
    headcount            INT                   NOT NULL,
    published_at         datetime              NULL,
    expires_at           datetime              NULL,
    closed_at            datetime              NULL,
    CONSTRAINT pk_jobs PRIMARY KEY (id)
);

CREATE TABLE password_reset_tokens
(
    id         BIGINT AUTO_INCREMENT NOT NULL,
    version    BIGINT                NOT NULL,
    created_at datetime              NOT NULL,
    updated_at datetime              NOT NULL,
    user_id    BIGINT                NOT NULL,
    token_hash VARCHAR(255)          NOT NULL,
    expires_at datetime              NOT NULL,
    used_at    datetime              NULL,
    CONSTRAINT pk_password_reset_tokens PRIMARY KEY (id)
);

CREATE TABLE refresh_tokens
(
    id         BIGINT AUTO_INCREMENT NOT NULL,
    version    BIGINT                NOT NULL,
    created_at datetime              NOT NULL,
    updated_at datetime              NOT NULL,
    user_id    BIGINT                NOT NULL,
    token_hash VARCHAR(255)          NOT NULL,
    expires_at datetime              NOT NULL,
    revoked_at datetime              NULL,
    CONSTRAINT pk_refresh_tokens PRIMARY KEY (id)
);




CREATE TABLE skills
(
    id         BIGINT AUTO_INCREMENT NOT NULL,
    version    BIGINT                NOT NULL,
    created_at datetime              NOT NULL,
    updated_at datetime              NOT NULL,
    name       VARCHAR(100)          NOT NULL,
    category   VARCHAR(100)          NULL,
    CONSTRAINT pk_skills PRIMARY KEY (id)
);



ALTER TABLE candidate_profiles
    ADD CONSTRAINT uk_candidate_profiles_user_id UNIQUE (user_id);

ALTER TABLE candidate_resumes
    ADD CONSTRAINT uk_candidate_resumes_storage_key UNIQUE (storage_key);

ALTER TABLE candidate_resumes
    ADD CONSTRAINT uk_candidate_resumes_id_profile UNIQUE (id, candidate_profile_id);

ALTER TABLE candidate_resumes
    ADD CONSTRAINT uk_candidate_resumes_primary_profile UNIQUE (primary_profile_id);

ALTER TABLE candidate_skills
    ADD CONSTRAINT uk_candidate_skills_profile_skill UNIQUE (candidate_profile_id, skill_id);

ALTER TABLE companies
    ADD CONSTRAINT uk_companies_slug UNIQUE (slug);

ALTER TABLE company_members
    ADD CONSTRAINT uk_company_members_company_user UNIQUE (company_id, user_id);

ALTER TABLE company_members
    ADD CONSTRAINT uk_company_members_id_company UNIQUE (id, company_id);

ALTER TABLE job_applications
    ADD CONSTRAINT uk_job_applications_job_candidate UNIQUE (job_id, candidate_profile_id);

ALTER TABLE job_skills
    ADD CONSTRAINT uk_job_skills_job_skill UNIQUE (job_id, skill_id);

ALTER TABLE jobs
    ADD CONSTRAINT uk_jobs_slug UNIQUE (slug);

ALTER TABLE password_reset_tokens
    ADD CONSTRAINT uk_password_reset_tokens_token_hash UNIQUE (token_hash);

ALTER TABLE refresh_tokens
    ADD CONSTRAINT uk_refresh_tokens_token_hash UNIQUE (token_hash);

ALTER TABLE application_screenings
    ADD CONSTRAINT uk_application_screenings_application_attempt UNIQUE (job_application_id, attempt);


ALTER TABLE skills
    ADD CONSTRAINT uk_skills_name UNIQUE (name);


CREATE INDEX idx_application_screenings_application_status ON application_screenings (job_application_id, status);

CREATE INDEX idx_job_applications_job_status ON job_applications (job_id, status);

CREATE INDEX idx_job_applications_candidate_status ON job_applications (candidate_profile_id, status);

CREATE INDEX idx_jobs_company_status_expires_at ON jobs (company_id, status, expires_at);

CREATE INDEX idx_jobs_status_expires_at ON jobs (status, expires_at);

ALTER TABLE application_screenings
    ADD CONSTRAINT FK_APPLICATION_SCREENINGS_APPLICATION FOREIGN KEY (job_application_id) REFERENCES job_applications (id);

ALTER TABLE application_status_histories
    ADD CONSTRAINT FK_APPLICATION_STATUS_HISTORIES_APPLICATION FOREIGN KEY (job_application_id) REFERENCES job_applications (id);

CREATE INDEX idx_application_status_histories_application_id ON application_status_histories (job_application_id);

CREATE INDEX idx_application_status_histories_application_created_at ON application_status_histories (job_application_id, created_at);

ALTER TABLE application_status_histories
    ADD CONSTRAINT FK_APPLICATION_STATUS_HISTORIES_CHANGED_BY FOREIGN KEY (changed_by_user_id) REFERENCES users (id);

ALTER TABLE candidate_educations
    ADD CONSTRAINT FK_CANDIDATE_EDUCATIONS_PROFILE FOREIGN KEY (candidate_profile_id) REFERENCES candidate_profiles (id);

CREATE INDEX idx_candidate_educations_profile_id ON candidate_educations (candidate_profile_id);

ALTER TABLE candidate_experiences
    ADD CONSTRAINT FK_CANDIDATE_EXPERIENCES_PROFILE FOREIGN KEY (candidate_profile_id) REFERENCES candidate_profiles (id);

CREATE INDEX idx_candidate_experiences_profile_id ON candidate_experiences (candidate_profile_id);

ALTER TABLE candidate_profiles
    ADD CONSTRAINT FK_CANDIDATE_PROFILES_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE candidate_resumes
    ADD CONSTRAINT FK_CANDIDATE_RESUMES_PROFILE FOREIGN KEY (candidate_profile_id) REFERENCES candidate_profiles (id);

CREATE INDEX idx_candidate_resumes_profile_id ON candidate_resumes (candidate_profile_id);

ALTER TABLE candidate_skills
    ADD CONSTRAINT FK_CANDIDATE_SKILLS_PROFILE FOREIGN KEY (candidate_profile_id) REFERENCES candidate_profiles (id);

CREATE INDEX idx_candidate_skills_profile_id ON candidate_skills (candidate_profile_id);

ALTER TABLE candidate_skills
    ADD CONSTRAINT FK_CANDIDATE_SKILLS_SKILL FOREIGN KEY (skill_id) REFERENCES skills (id);

ALTER TABLE company_members
    ADD CONSTRAINT FK_COMPANY_MEMBERS_COMPANY FOREIGN KEY (company_id) REFERENCES companies (id);

ALTER TABLE company_members
    ADD CONSTRAINT FK_COMPANY_MEMBERS_USER FOREIGN KEY (user_id) REFERENCES users (id);

CREATE INDEX idx_company_members_user_id ON company_members (user_id);

ALTER TABLE jobs
    ADD CONSTRAINT FK_JOBS_COMPANY FOREIGN KEY (company_id) REFERENCES companies (id);

ALTER TABLE jobs
    ADD CONSTRAINT FK_JOBS_CREATED_BY_MEMBER_COMPANY FOREIGN KEY (created_by_member_id, company_id) REFERENCES company_members (id, company_id);

ALTER TABLE job_applications
    ADD CONSTRAINT FK_JOB_APPLICATIONS_CANDIDATE_PROFILE FOREIGN KEY (candidate_profile_id) REFERENCES candidate_profiles (id);

ALTER TABLE job_applications
    ADD CONSTRAINT FK_JOB_APPLICATIONS_CANDIDATE_RESUME_OWNER FOREIGN KEY (candidate_resume_id, candidate_profile_id) REFERENCES candidate_resumes (id, candidate_profile_id);

ALTER TABLE job_applications
    ADD CONSTRAINT FK_JOB_APPLICATIONS_JOB FOREIGN KEY (job_id) REFERENCES jobs (id);

ALTER TABLE job_skills
    ADD CONSTRAINT FK_JOB_SKILLS_JOB FOREIGN KEY (job_id) REFERENCES jobs (id);

ALTER TABLE job_skills
    ADD CONSTRAINT FK_JOB_SKILLS_SKILL FOREIGN KEY (skill_id) REFERENCES skills (id);

ALTER TABLE password_reset_tokens
    ADD CONSTRAINT FK_PASSWORD_RESET_TOKENS_USER FOREIGN KEY (user_id) REFERENCES users (id);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens (user_id);

CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens (expires_at);

ALTER TABLE refresh_tokens
    ADD CONSTRAINT FK_REFRESH_TOKENS_USER FOREIGN KEY (user_id) REFERENCES users (id);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);

CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);

ALTER TABLE candidate_educations
    ADD CONSTRAINT chk_candidate_educations_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date);

ALTER TABLE candidate_experiences
    ADD CONSTRAINT chk_candidate_experiences_dates CHECK (end_date IS NULL OR end_date >= start_date);

ALTER TABLE candidate_experiences
    ADD CONSTRAINT chk_candidate_experiences_dates_not_negative CHECK (start_date IS NOT NULL);

ALTER TABLE candidate_resumes
    ADD CONSTRAINT chk_candidate_resumes_file_size CHECK (file_size_bytes > 0);

ALTER TABLE candidate_skills
    ADD CONSTRAINT chk_candidate_skills_years CHECK (years_of_experience IS NULL OR years_of_experience >= 0);

ALTER TABLE job_skills
    ADD CONSTRAINT chk_job_skills_minimum_years CHECK (minimum_years IS NULL OR minimum_years >= 0);

ALTER TABLE jobs
    ADD CONSTRAINT chk_jobs_headcount CHECK (headcount > 0);

ALTER TABLE jobs
    ADD CONSTRAINT chk_jobs_salary_range CHECK (
        (salary_min IS NULL OR salary_min >= 0)
        AND (salary_max IS NULL OR salary_max >= 0)
        AND (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max)
    );

ALTER TABLE jobs
    ADD CONSTRAINT chk_jobs_expiry_after_publication CHECK (
        expires_at IS NULL OR published_at IS NULL OR expires_at > published_at
    );

ALTER TABLE application_screenings
    ADD CONSTRAINT chk_application_screenings_score CHECK (score IS NULL OR score BETWEEN 0 AND 100);
