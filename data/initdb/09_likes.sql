DROP TABLE IF EXISTS likes CASCADE;

CREATE TABLE likes
(
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    liked_user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    created_at      TIMESTAMP DEFAULT now(),

    PRIMARY KEY (user_id, liked_user_id)
);

CREATE OR REPLACE FUNCTION create_like_notification()
    RETURNS TRIGGER AS $$
BEGIN
    EXECUTE 'INSERT INTO notifications (user_id, type, content) VALUES ($1, $2, $3)'
    USING NEW.liked_user_id, 'like', 'You have a new like!';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER new_like
AFTER INSERT ON likes
FOR EACH ROW
EXECUTE FUNCTION create_like_notification();