--- Table: tags
--- Table for storing tags that can be used to describe users
CREATE TABLE tags
(
    id         INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name       VARCHAR(20) NOT NULL UNIQUE,

    created_at TIMESTAMP DEFAULT now()
);

--- Index: idx_tags_name
--- Index for the name column as the name is used to search for tags
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags (name);

--- Table: users_tags
--- Table for storing the many-to-many relationship between users and tags
CREATE TABLE users_tags
(
    user_id    INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    tag_id     INTEGER NOT NULL REFERENCES tags (id) ON DELETE CASCADE,

    created_at TIMESTAMP DEFAULT now(),

    PRIMARY KEY (user_id, tag_id)
);