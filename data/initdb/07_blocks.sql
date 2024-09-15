CREATE TABLE blocks
(
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    blocked_at      TIMESTAMP DEFAULT now(),

    PRIMARY KEY (user_id, blocked_user_id)
);