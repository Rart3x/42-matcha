CREATE TABLE likes
(
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    liked_user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    created_at      TIMESTAMP DEFAULT now(),

    PRIMARY KEY (user_id, liked_user_id)
);

CREATE TRIGGER new_like
AFTER INSERT ON likes
FOR EACH ROW
EXECUTE FUNCTION create_notification(NEW.liked_user_id, 'like', 'You have a new like!');