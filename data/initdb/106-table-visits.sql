--- Table: visits
--- Table for storing visits of a user profile by another user
CREATE TABLE visits
(
    visiter_user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    visited_user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,

    created_at      TIMESTAMP DEFAULT now(),

    PRIMARY KEY (visiter_user_id, visited_user_id)
);