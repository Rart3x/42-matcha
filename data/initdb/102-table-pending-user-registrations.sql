--- Require the pgcrypto extension to generate UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

--- Table: pending_user_registrations
--- Table for pending user registrations that have not been confirmed yet
--- The token is used to confirm the registration
CREATE TABLE pending_user_registrations
(
    id         INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

    token      UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),

    username   TEXT NOT NULL UNIQUE CHECK (3 <= length(username) AND length(username) <= 20),
    email      TEXT NOT NULL UNIQUE CHECK (length(email) <= 255),

    password   TEXT NOT NULL CHECK (length(password) = 60),

    first_name TEXT NOT NULL CHECK (length(first_name) <= 30),
    last_name  TEXT NOT NULL CHECK (length(last_name) <= 30),

    created_at TIMESTAMP            DEFAULT now(),
    expires_at TIMESTAMP GENERATED ALWAYS AS ( created_at + INTERVAL '10 minutes' ) STORED
);

--- Index: idx_pending_user_registrations_token
--- Index for the token column as it is used in the registration process
CREATE INDEX idx_pending_user_registrations_token ON pending_user_registrations (token);
