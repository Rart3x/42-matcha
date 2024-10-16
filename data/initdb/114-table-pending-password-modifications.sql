CREATE TABLE pending_password_modifications
(
    id         INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

    token      UUID    NOT NULL UNIQUE DEFAULT gen_random_uuid(),

    new_password  TEXT    NOT NULL CHECK (length(new_password) < 255),

    user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,

    created_at TIMESTAMP               DEFAULT now(),
    expires_at TIMESTAMP GENERATED ALWAYS AS (created_at + INTERVAL '10 min') STORED
);

CREATE INDEX idx_pending_password_modifications_token ON pending_password_modifications (token);