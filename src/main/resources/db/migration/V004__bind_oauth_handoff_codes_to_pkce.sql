ALTER TABLE oauth_authorization_codes
    ADD COLUMN code_challenge VARCHAR(128) NOT NULL DEFAULT 'legacy-code-revoked';

ALTER TABLE oauth_authorization_codes
    ALTER COLUMN code_challenge DROP DEFAULT;
