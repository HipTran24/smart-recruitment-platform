-- V010: Add recruitment workflow tables: interviews, job offers, application evaluations,
-- feedback drafts, user notifications, and platform audit events.
-- Also add consent tracking to candidate profiles and scan status to candidate resumes.

-- 1. Candidate Consent & Resume Extraction
ALTER TABLE candidate_profiles
    ADD COLUMN ai_processing_consented BIT(1) NOT NULL DEFAULT b'1',
    ADD COLUMN consented_at datetime(6) NULL;

ALTER TABLE candidate_resumes
    ADD COLUMN scan_status VARCHAR(20) NOT NULL DEFAULT 'CLEAN',
    ADD COLUMN parsed_text MEDIUMTEXT NULL;

ALTER TABLE candidate_resumes
    ADD CONSTRAINT chk_candidate_resumes_scan_status
    CHECK (scan_status IN ('PENDING', 'SCANNING', 'CLEAN', 'QUARANTINED', 'UNSUPPORTED'));

-- 2. Interviews
CREATE TABLE interviews
(
    id                 BIGINT AUTO_INCREMENT NOT NULL,
    version            BIGINT                NOT NULL DEFAULT 0,
    created_at         datetime(6)           NOT NULL,
    updated_at         datetime(6)           NOT NULL,
    job_application_id BIGINT                NOT NULL,
    candidate_user_id  BIGINT                NOT NULL,
    recruiter_user_id  BIGINT                NOT NULL,
    title              VARCHAR(200)          NOT NULL,
    scheduled_at       datetime(6)           NOT NULL,
    duration_minutes   INT                   NOT NULL DEFAULT 45,
    location_or_url    VARCHAR(500)          NULL,
    status             VARCHAR(20)           NOT NULL DEFAULT 'SCHEDULED',
    timezone           VARCHAR(50)           NOT NULL DEFAULT 'UTC',
    notes              TEXT                  NULL,
    CONSTRAINT pk_interviews PRIMARY KEY (id),
    CONSTRAINT fk_interviews_application FOREIGN KEY (job_application_id) REFERENCES job_applications (id),
    CONSTRAINT fk_interviews_candidate FOREIGN KEY (candidate_user_id) REFERENCES users (id),
    CONSTRAINT fk_interviews_recruiter FOREIGN KEY (recruiter_user_id) REFERENCES users (id),
    CONSTRAINT chk_interviews_status CHECK (status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED'))
);

CREATE INDEX idx_interviews_application ON interviews (job_application_id);
CREATE INDEX idx_interviews_candidate ON interviews (candidate_user_id, scheduled_at);
CREATE INDEX idx_interviews_recruiter ON interviews (recruiter_user_id, scheduled_at);

-- 3. Job Offers
CREATE TABLE job_offers
(
    id                 BIGINT AUTO_INCREMENT NOT NULL,
    version            BIGINT                NOT NULL DEFAULT 0,
    created_at         datetime(6)           NOT NULL,
    updated_at         datetime(6)           NOT NULL,
    job_application_id BIGINT                NOT NULL,
    candidate_user_id  BIGINT                NOT NULL,
    created_by_user_id BIGINT                NOT NULL,
    salary_offered     DECIMAL(15, 2)        NOT NULL,
    salary_currency    VARCHAR(3)            NOT NULL DEFAULT 'VND',
    start_date         date                  NOT NULL,
    deadline           datetime(6)           NOT NULL,
    status             VARCHAR(20)           NOT NULL DEFAULT 'DRAFT',
    terms_version      INT                   NOT NULL DEFAULT 1,
    notes              TEXT                  NULL,
    candidate_comment  TEXT                  NULL,
    responded_at       datetime(6)           NULL,
    CONSTRAINT pk_job_offers PRIMARY KEY (id),
    CONSTRAINT fk_job_offers_application FOREIGN KEY (job_application_id) REFERENCES job_applications (id),
    CONSTRAINT fk_job_offers_candidate FOREIGN KEY (candidate_user_id) REFERENCES users (id),
    CONSTRAINT fk_job_offers_creator FOREIGN KEY (created_by_user_id) REFERENCES users (id),
    CONSTRAINT chk_job_offers_status CHECK (status IN ('DRAFT', 'SENT', 'ACCEPTED', 'DECLINED', 'WITHDRAWN'))
);

CREATE INDEX idx_job_offers_application ON job_offers (job_application_id);
CREATE INDEX idx_job_offers_candidate ON job_offers (candidate_user_id, status);

-- 4. Application Evaluations
CREATE TABLE application_evaluations
(
    id                 BIGINT AUTO_INCREMENT NOT NULL,
    version            BIGINT                NOT NULL DEFAULT 0,
    created_at         datetime(6)           NOT NULL,
    updated_at         datetime(6)           NOT NULL,
    job_application_id BIGINT                NOT NULL,
    evaluator_user_id  BIGINT                NOT NULL,
    score              INT                   NOT NULL,
    recommendation     VARCHAR(30)           NOT NULL,
    technical_notes    TEXT                  NULL,
    cultural_fit_notes TEXT                  NULL,
    strengths          TEXT                  NULL,
    areas_for_growth   TEXT                  NULL,
    CONSTRAINT pk_application_evaluations PRIMARY KEY (id),
    CONSTRAINT fk_application_evaluations_application FOREIGN KEY (job_application_id) REFERENCES job_applications (id),
    CONSTRAINT fk_application_evaluations_evaluator FOREIGN KEY (evaluator_user_id) REFERENCES users (id),
    CONSTRAINT chk_evaluations_recommendation CHECK (recommendation IN ('STRONG_YES', 'YES', 'NEUTRAL', 'NO', 'STRONG_NO')),
    CONSTRAINT chk_evaluations_score CHECK (score >= 0 AND score <= 100)
);

CREATE INDEX idx_application_evaluations_application ON application_evaluations (job_application_id);

-- 5. Feedback Drafts
CREATE TABLE feedback_drafts
(
    id                  BIGINT AUTO_INCREMENT NOT NULL,
    version             BIGINT                NOT NULL DEFAULT 0,
    created_at          datetime(6)           NOT NULL,
    updated_at          datetime(6)           NOT NULL,
    job_application_id  BIGINT                NOT NULL,
    author_user_id      BIGINT                NOT NULL,
    content             TEXT                  NOT NULL,
    status              VARCHAR(20)           NOT NULL DEFAULT 'DRAFT',
    delivery_status     VARCHAR(20)           NULL,
    approved_by_user_id BIGINT                NULL,
    approved_at         datetime(6)           NULL,
    sent_at             datetime(6)           NULL,
    CONSTRAINT pk_feedback_drafts PRIMARY KEY (id),
    CONSTRAINT fk_feedback_drafts_application FOREIGN KEY (job_application_id) REFERENCES job_applications (id),
    CONSTRAINT fk_feedback_drafts_author FOREIGN KEY (author_user_id) REFERENCES users (id),
    CONSTRAINT fk_feedback_drafts_approver FOREIGN KEY (approved_by_user_id) REFERENCES users (id),
    CONSTRAINT chk_feedback_drafts_status CHECK (status IN ('DRAFT', 'APPROVED', 'SENT')),
    CONSTRAINT chk_feedback_drafts_delivery CHECK (delivery_status IS NULL OR delivery_status IN ('QUEUED', 'DELIVERED', 'FAILED'))
);

CREATE INDEX idx_feedback_drafts_application ON feedback_drafts (job_application_id);

-- 6. User Notifications
CREATE TABLE user_notifications
(
    id         BIGINT AUTO_INCREMENT NOT NULL,
    version    BIGINT                NOT NULL DEFAULT 0,
    created_at datetime(6)           NOT NULL,
    updated_at datetime(6)           NOT NULL,
    user_id    BIGINT                NOT NULL,
    title      VARCHAR(200)          NOT NULL,
    message    TEXT                  NOT NULL,
    type       VARCHAR(50)           NOT NULL,
    is_read    BIT(1)                NOT NULL DEFAULT b'0',
    read_at    datetime(6)           NULL,
    action_url VARCHAR(500)          NULL,
    CONSTRAINT pk_user_notifications PRIMARY KEY (id),
    CONSTRAINT fk_user_notifications_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_user_notifications_user_read ON user_notifications (user_id, is_read, created_at);

-- 7. Platform Audit Events
CREATE TABLE audit_events
(
    id            BIGINT AUTO_INCREMENT NOT NULL,
    created_at    datetime(6)           NOT NULL,
    actor_user_id BIGINT                NULL,
    action        VARCHAR(100)          NOT NULL,
    resource_type VARCHAR(50)           NOT NULL,
    resource_id   VARCHAR(100)          NOT NULL,
    metadata_json TEXT                  NULL,
    ip_address    VARCHAR(50)           NULL,
    CONSTRAINT pk_audit_events PRIMARY KEY (id),
    CONSTRAINT fk_audit_events_actor FOREIGN KEY (actor_user_id) REFERENCES users (id)
);

CREATE INDEX idx_audit_events_created_at ON audit_events (created_at);
CREATE INDEX idx_audit_events_resource ON audit_events (resource_type, resource_id);
