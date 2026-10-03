-- Convert job creator membership references to user references (ADR 0003)

ALTER TABLE jobs
    ADD COLUMN created_by_user_id BIGINT NULL;

UPDATE jobs j
JOIN company_members cm ON j.created_by_member_id = cm.id
SET j.created_by_user_id = cm.user_id;

UPDATE jobs j
SET j.created_by_user_id = j.created_by_member_id
WHERE j.created_by_user_id IS NULL;

ALTER TABLE jobs
    MODIFY COLUMN created_by_user_id BIGINT NOT NULL;

ALTER TABLE jobs
    MODIFY COLUMN created_by_member_id BIGINT NULL;

ALTER TABLE jobs
    ADD CONSTRAINT fk_jobs_created_by_user FOREIGN KEY (created_by_user_id) REFERENCES users (id);

CREATE INDEX idx_jobs_created_by_user ON jobs (created_by_user_id);
