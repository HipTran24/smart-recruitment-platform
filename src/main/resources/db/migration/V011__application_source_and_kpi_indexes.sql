-- Historical attribution is unavailable; never infer a source from candidate PII.
ALTER TABLE job_applications ADD COLUMN source VARCHAR(64) NOT NULL DEFAULT 'UNKNOWN';
CREATE INDEX idx_applications_created ON job_applications(created_at);
CREATE INDEX idx_applications_job_created ON job_applications(job_id, created_at);
CREATE INDEX idx_applications_source_created ON job_applications(source, created_at);
