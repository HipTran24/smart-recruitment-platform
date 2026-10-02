ALTER TABLE oauth_authorization_codes
    ADD COLUMN transaction_id VARCHAR(64) NOT NULL DEFAULT 'legacy-transaction-revoked';

ALTER TABLE oauth_authorization_codes
    ALTER COLUMN transaction_id DROP DEFAULT;
