CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TABLE IF EXISTS users_registrations CASCADE;

CREATE TABLE IF NOT EXISTS users_registrations
(
    id         INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

    token      UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),

    username   TEXT NOT NULL UNIQUE CHECK (3 < length(username) AND length(username) < 20),
    email      TEXT NOT NULL UNIQUE CHECK (length(email) < 255),

    password   TEXT NOT NULL CHECK (length(password) = 64),

    first_name TEXT NOT NULL CHECK (length(first_name) < 255),
    last_name  TEXT NOT NULL CHECK (length(last_name) < 255),

    created_at TIMESTAMP            DEFAULT now(),
    updated_at TIMESTAMP            DEFAULT now(),
    expires_at TIMESTAMP            GENERATED ALWAYS AS ( created_at + INTERVAL '10 minutes' ) STORED
);

CREATE INDEX IF NOT EXISTS idx_token ON users_registrations (token);

CREATE OR REPLACE TRIGGER update_timestamp
    BEFORE UPDATE
    ON users_registrations
    FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
