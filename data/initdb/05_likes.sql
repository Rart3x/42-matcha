-- pgsql dialect --

BEGIN TRANSACTION;

CREATE TABLE likes
(
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    liked_user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    created_at      TIMESTAMP DEFAULT now(),

    PRIMARY KEY (user_id, liked_user_id)
);

-- Create a like for a user --
CREATE FUNCTION create_like(_user_id INTEGER, _liked_user_id INTEGER) RETURNS VOID AS $$
BEGIN
    INSERT INTO likes (user_id, liked_user_id)
    VALUES (_user_id, _liked_user_id);
END;
$$ LANGUAGE plpgsql;

-- Get all likes for a user --
-- CREATE OR REPLACE FUNCTION get_likes_by_liked_user_id(_liked_user_id INTEGER)
--     RETURNS TABLE(like_id INT, liked_user_id INT, post_id INT, created_at TIMESTAMP) AS $$
-- DECLARE
--     cur CURSOR FOR
--         SELECT *
--         FROM likes
--         WHERE liked_user_id = _liked_user_id
--         ORDER BY created_at DESC;
--     row RECORD;
--     line_count INTEGER := 0;
-- BEGIN
--     OPEN cur;
--     LOOP
--         FETCH NEXT FROM cur INTO row;
--         EXIT WHEN NOT FOUND;
--
--         line_count := line_count + 1;
--
--         IF line_count % 25 = 0 THEN
--             CLOSE cur;
--             RETURN QUERY SELECT * FROM get_likes_by_liked_user_id(_liked_user_id);
--         ELSE
--             RETURN NEXT row;
--         END IF;
--     END LOOP;
--
--     CLOSE cur;
-- END;
-- $$ LANGUAGE plpgsql;

-- Delete a like by its ID --
CREATE FUNCTION delete_like(_user_id INTEGER, _liked_user_id INTEGER) RETURNS VOID AS $$
BEGIN
    DELETE FROM likes
    WHERE user_id = _user_id AND liked_user_id = _liked_user_id;
END;
$$ LANGUAGE plpgsql;

END TRANSACTION;