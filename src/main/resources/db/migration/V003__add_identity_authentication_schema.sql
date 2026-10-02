CREATE TABLE user_oauth_identities
(
    id               BIGINT AUTO_INCREMENT NOT NULL,
    version          BIGINT                NOT NULL,
    created_at       datetime              NOT NULL,
    updated_at       datetime              NOT NULL,
    user_id          BIGINT                NOT NULL,
    provider         VARCHAR(30)           NOT NULL,
    provider_subject VARCHAR(255)          NOT NULL,
    provider_email   VARCHAR(255)          NULL,
    email_verified   BIT(1)                NOT NULL,
    CONSTRAINT pk_user_oauth_identities PRIMARY KEY (id)
);

CREATE TABLE oauth_authorization_codes
(
    id         BIGINT AUTO_INCREMENT NOT NULL,
    version    BIGINT                NOT NULL,
    created_at datetime              NOT NULL,
    updated_at datetime              NOT NULL,
    user_id    BIGINT                NOT NULL,
    code_hash  VARCHAR(64)           NOT NULL,
    expires_at datetime              NOT NULL,
    consumed_at datetime             NULL,
    CONSTRAINT pk_oauth_authorization_codes PRIMARY KEY (id)
);

ALTER TABLE user_oauth_identities
    ADD CONSTRAINT uk_user_oauth_identities_provider_subject UNIQUE (provider, provider_subject);

ALTER TABLE user_oauth_identities
    ADD CONSTRAINT uk_user_oauth_identities_user_provider UNIQUE (user_id, provider);

ALTER TABLE oauth_authorization_codes
    ADD CONSTRAINT uk_oauth_authorization_codes_code_hash UNIQUE (code_hash);

ALTER TABLE user_oauth_identities
    ADD CONSTRAINT fk_user_oauth_identities_user FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE oauth_authorization_codes
    ADD CONSTRAINT fk_oauth_authorization_codes_user FOREIGN KEY (user_id) REFERENCES users (id);

CREATE INDEX idx_user_oauth_identities_user_id ON user_oauth_identities (user_id);

CREATE INDEX idx_oauth_authorization_codes_expires_at ON oauth_authorization_codes (expires_at);

INSERT INTO roles (code, name, version, created_at, updated_at)
SELECT 'ROLE_CANDIDATE', 'Candidate', 0, UTC_TIMESTAMP(), UTC_TIMESTAMP()
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE code = 'ROLE_CANDIDATE'
);
