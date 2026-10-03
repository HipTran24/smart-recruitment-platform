ALTER TABLE users
    ADD COLUMN credential_version INT NOT NULL DEFAULT 1,
    ADD COLUMN email_verified BIT(1) NOT NULL DEFAULT 0;

INSERT INTO roles (code, name, version, created_at, updated_at)
SELECT 'ROLE_RECRUITER', 'Recruiter', 0, UTC_TIMESTAMP(), UTC_TIMESTAMP()
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE code = 'ROLE_RECRUITER'
);

INSERT INTO roles (code, name, version, created_at, updated_at)
SELECT 'ROLE_PLATFORM_ADMIN', 'Platform Administrator', 0, UTC_TIMESTAMP(), UTC_TIMESTAMP()
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE code = 'ROLE_PLATFORM_ADMIN'
);

CREATE TABLE email_verification_tokens
(
    id          BIGINT AUTO_INCREMENT NOT NULL,
    version     BIGINT                NOT NULL,
    created_at  datetime              NOT NULL,
    updated_at  datetime              NOT NULL,
    user_id     BIGINT                NOT NULL,
    token_hash  VARCHAR(64)           NOT NULL,
    expires_at  datetime              NOT NULL,
    consumed_at datetime              NULL,
    CONSTRAINT pk_email_verification_tokens PRIMARY KEY (id)
);

ALTER TABLE email_verification_tokens
    ADD CONSTRAINT uk_email_verification_tokens_token_hash UNIQUE (token_hash);

ALTER TABLE email_verification_tokens
    ADD CONSTRAINT fk_email_verification_tokens_user FOREIGN KEY (user_id) REFERENCES users (id);

CREATE INDEX idx_email_verification_tokens_expires_at ON email_verification_tokens (expires_at);
CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens (user_id);
