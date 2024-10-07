--- Table: notifications
--- Table for storing notifications
CREATE TABLE notifications
(
    id               INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

    notified_user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,

    type             TEXT    NOT NULL,
    content          TEXT    NOT NULL,
    is_viewed        BOOLEAN   DEFAULT FALSE,

    created_at       TIMESTAMP DEFAULT now(),
    updated_at       TIMESTAMP DEFAULT now()
);