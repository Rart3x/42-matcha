CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TABLE IF EXISTS sessions CASCADE;

CREATE TABLE IF NOT EXISTS sessions
(
    id         INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

    token      UUID    NOT NULL UNIQUE DEFAULT gen_random_uuid(),

    user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,

    created_at TIMESTAMP               DEFAULT now(),
    updated_at TIMESTAMP               DEFAULT now(),

    expires_at TIMESTAMP GENERATED ALWAYS AS (created_at + INTERVAL '3 day') STORED
);

CREATE INDEX IF NOT EXISTS idx_token ON sessions (token);

CREATE OR REPLACE TRIGGER update_timestamp
    BEFORE UPDATE
    ON sessions
    FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
