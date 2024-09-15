DROP TABLE IF EXISTS messages CASCADE;

CREATE TABLE IF NOT EXISTS messages
(
    id          INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

    sender_id   INTEGER NOT NULL REFERENCES users(id),
    receiver_id INTEGER NOT NULL REFERENCES users(id),

    message     TEXT    NOT NULL CHECK (length(message) <= 255),

    seen        BOOLEAN DEFAULT FALSE,

    created_at  TIMESTAMP DEFAULT now()
);