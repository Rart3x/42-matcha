DROP TABLE IF EXISTS tags CASCADE;

CREATE TABLE tags
(
    id         INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name       VARCHAR(20) NOT NULL UNIQUE,

    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TRIGGER update_tags_updated_at
    AFTER UPDATE
    ON tags
    FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE INDEX IF NOT EXISTS idx_tags_name ON tags (name);

CREATE TABLE users_tags
(
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tag_id      INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,

    created_at  TIMESTAMP DEFAULT now(),

    PRIMARY KEY (user_id, tag_id)
);