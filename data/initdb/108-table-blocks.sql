--- Table: blocks
--- Table for storing blocks from a user to another user
CREATE TABLE blocks
(
    blocker_user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    blocked_user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,

    created_at      TIMESTAMP DEFAULT now(),

    PRIMARY KEY (blocker_user_id, blocked_user_id)
);