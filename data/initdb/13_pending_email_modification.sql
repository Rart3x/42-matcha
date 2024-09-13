DROP TABLE IF EXISTS pending_email_modification;

CREATE TABLE pending_email_modification
(
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    token           UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),

    new_email       TEXT NOT NULL CHECK (length(new_email) < 255),

    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    created_at      TIMESTAMP        DEFAULT now(),
    expires_at      TIMESTAMP GENERATED ALWAYS AS (created_at + INTERVAL '10 min') STORED
);
