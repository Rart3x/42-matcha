--- Require the pgcrypto extension to generate UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

--- Table: sessions
--- Table for user sessions
--- The token is used to authenticate the user
--- The expires_at column is used to determine when the session expires
--- If the session expires, the user will have to log in again
CREATE TABLE IF NOT EXISTS sessions
(
    id         INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

    token      UUID    NOT NULL UNIQUE DEFAULT gen_random_uuid(),

    user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,

    created_at TIMESTAMP               DEFAULT now(),
    updated_at TIMESTAMP               DEFAULT now(),

    expires_at TIMESTAMP GENERATED ALWAYS AS (updated_at + INTERVAL '3 day') STORED
);

--- Index: idx_sessions_token
--- Index for the token column as it is used in the authentication process
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions (token);