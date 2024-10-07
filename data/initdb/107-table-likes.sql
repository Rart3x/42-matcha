--- Table: likes
--- Table for storing likes from a user to another user
CREATE TABLE likes
(
    liker_user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    liked_user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,

    created_at    TIMESTAMP DEFAULT now(),

    PRIMARY KEY (liker_user_id, liked_user_id)
);