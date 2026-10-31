ALTER TABLE application_screenings ADD COLUMN next_attempt_at DATETIME(6) NULL;
CREATE INDEX idx_screening_retry ON application_screenings(status, next_attempt_at);
