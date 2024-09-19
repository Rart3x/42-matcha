--- Require the pgcrypto extension to generate UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

--- Table: pending_email_modifications
--- Table for pending email modifications that have not been confirmed yet
--- The token is used to confirm the modification
CREATE TABLE pending_email_modifications
(
    id         INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

    token      UUID    NOT NULL UNIQUE DEFAULT gen_random_uuid(),

    new_email  TEXT    NOT NULL CHECK (length(new_email) < 255),

    user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,

    created_at TIMESTAMP               DEFAULT now(),
    expires_at TIMESTAMP GENERATED ALWAYS AS (created_at + INTERVAL '10 min') STORED
);

--- Index: idx_pending_email_modifications_token
--- Index for the token column as it is used in the registration process
CREATE INDEX idx_pending_email_modifications_token ON pending_email_modifications (token);
