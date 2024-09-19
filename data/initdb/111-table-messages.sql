--- Table: messages
--- Table for storing messages between users
CREATE TABLE messages
(
    id          INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

    sender_id   INTEGER NOT NULL REFERENCES users (id),
    receiver_id INTEGER NOT NULL REFERENCES users (id),

    message     TEXT    NOT NULL CHECK (length(message) <= 255),

    is_seen     BOOLEAN   DEFAULT FALSE,

    created_at  TIMESTAMP DEFAULT now(),
    updated_at  TIMESTAMP DEFAULT now()
);