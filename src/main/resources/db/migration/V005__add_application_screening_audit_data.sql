-- Preserve provider output needed for recruiter review, and durable worker-lease state needed to
-- recover safely when a worker dies after claiming a screening. No raw CV input is stored here.
ALTER TABLE application_screenings
    MODIFY COLUMN matched_criteria MEDIUMTEXT NULL,
    MODIFY COLUMN missing_criteria MEDIUMTEXT NULL,
    ADD COLUMN limitations MEDIUMTEXT NULL AFTER missing_criteria,
    ADD COLUMN failure_code VARCHAR(64) NULL AFTER error_message,
    ADD COLUMN retryable BIT(1) NULL AFTER failure_code,
    ADD COLUMN processing_lease_token VARCHAR(64) NULL AFTER retryable,
    ADD COLUMN processing_lease_expires_at datetime NULL AFTER processing_lease_token;

CREATE INDEX idx_application_screenings_status_lease_expires_at
    ON application_screenings (status, processing_lease_expires_at);

ALTER TABLE application_screenings
    ADD CONSTRAINT chk_application_screenings_attempt_positive CHECK (attempt > 0);
