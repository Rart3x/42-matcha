CREATE TABLE IF NOT EXISTS users
(
    id          INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

    username    TEXT    NOT NULL UNIQUE CHECK (3 <= length(username) AND length(username) <= 20),
    email       TEXT    NOT NULL UNIQUE CHECK (length(email) <= 255),

    password    TEXT    NOT NULL CHECK (length(password) = 60),

    first_name  TEXT    NOT NULL CHECK (length(first_name) <= 30),
    last_name   TEXT    NOT NULL CHECK (length(last_name) <= 30),

    age         INTEGER NULL CHECK (18 <= age),
    biography   TEXT    NULL CHECK (length(biography) < 255),
    gender      TEXT    NULL CHECK (length(gender) < 255),
    sexual_pref TEXT    NULL CHECK (length(sexual_pref) < 255),

    fame_rating INTEGER   DEFAULT 0,

    created_at  TIMESTAMP DEFAULT now(),
    updated_at  TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_username ON users (username);

CREATE OR REPLACE TRIGGER update_timestamp
    BEFORE UPDATE
    ON users
    FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
