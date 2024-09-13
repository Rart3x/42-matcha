-- pgsql dialect --

BEGIN TRANSACTION;

CREATE TABLE visits
(
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    visited_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    visited_at      TIMESTAMP DEFAULT now(),

    PRIMARY KEY (user_id, visited_user_id)
);

-- Create a visit for a user --
CREATE FUNCTION create_visit(_user_id INTEGER, _visited_user_id INTEGER) RETURNS VOID AS $$
BEGIN
    INSERT INTO visits (user_id, visited_user_id)
    VALUES (_user_id, _visited_user_id);
END;
$$ LANGUAGE plpgsql;

-- Get all visits for a user --
CREATE FUNCTION get_visits_by_visited_user_id(_visited_user_id INTEGER) RETURNS SETOF visits AS $$
BEGIN
    RETURN QUERY (
        SELECT *
        FROM visits
        WHERE visited_user_id = _visited_user_id
        ORDER BY visited_at DESC LIMIT 25
    );
END;
$$ LANGUAGE plpgsql;

END TRANSACTION;