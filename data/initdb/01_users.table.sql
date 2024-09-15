
CREATE TABLE IF NOT EXISTS users
(
    id               INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

    username         TEXT    NOT NULL UNIQUE CHECK (3 <= length(username) AND length(username) <= 20),
    email            TEXT    NOT NULL UNIQUE CHECK (length(email) <= 255),

    password         TEXT    NOT NULL CHECK (length(password) = 60),

    first_name       TEXT    NOT NULL CHECK (length(first_name) <= 30),
    last_name        TEXT    NOT NULL CHECK (length(last_name) <= 30),

    age              INTEGER NULL CHECK (18 <= age),
    biography        TEXT    NULL CHECK (length(biography) < 255),
    gender           TEXT    NULL CHECK (gender IN ('male', 'female', 'other')),
    sexual_pref      TEXT    NULL CHECK (sexual_pref IN ('male', 'female', 'any')),

    fame_rating      INTEGER   DEFAULT 0,

    profile_complete BOOLEAN   DEFAULT FALSE,

    created_at       TIMESTAMP DEFAULT now(),
    updated_at       TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_username ON users (username);

CREATE OR REPLACE TRIGGER update_timestamp
    BEFORE UPDATE
    ON users
    FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE OR REPLACE FUNCTION update_fame_rating_on_reported()
    RETURNS TRIGGER AS
$$
BEGIN
    UPDATE users
    SET fame_rating = fame_rating - 1
    WHERE id = NEW.reported_user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_fame_rating_on_unreported()
    RETURNS TRIGGER AS
$$
BEGIN
    UPDATE users
    SET fame_rating = fame_rating + 1
    WHERE id = OLD.reported_user_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;