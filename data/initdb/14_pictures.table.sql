CREATE TABLE pictures
(
    id         INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

    user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,

    position   INTEGER NOT NULL CHECK (0 <= position AND position <= 4),

    url        TEXT    NOT NULL CHECK (length(url) <= 255),
    mime_type  TEXT    NOT NULL CHECK (length(mime_type) <= 255),

    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);