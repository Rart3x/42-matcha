DROP TABLE IF EXISTS visits CASCADE;

CREATE TABLE visits
(
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    visited_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    visited_at      TIMESTAMP DEFAULT now(),

    PRIMARY KEY (user_id, visited_user_id)
);

CREATE OR REPLACE FUNCTION create_visit_notification()
    RETURNS TRIGGER AS $$
BEGIN
    EXECUTE 'INSERT INTO notifications (user_id, type, content) VALUES ($1, $2, $3)'
    USING NEW.visited_user_id, 'visit', 'You have a new visit!';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER new_visit
AFTER INSERT ON visits
FOR EACH ROW
EXECUTE FUNCTION create_visit_notification();