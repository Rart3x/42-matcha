CREATE TABLE visits
(
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    visited_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    visited_at      TIMESTAMP DEFAULT now(),

    PRIMARY KEY (user_id, visited_user_id)
);

CREATE TRIGGER new_visit
AFTER INSERT ON visits
FOR EACH ROW
EXECUTE FUNCTION create_notification(NEW.visited_user_id, 'visit', 'You have a new visit!');