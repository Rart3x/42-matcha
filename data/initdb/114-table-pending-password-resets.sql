CREATE TABLE pending_password_resets
    (
        id INTEGER
            PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

        token uuid NOT NULL
            UNIQUE DEFAULT gen_random_uuid(),

        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP GENERATED ALWAYS AS (created_at + INTERVAL '10 min') STORED
    );

CREATE INDEX idx_pending_password_resets_token ON pending_password_resets (token);