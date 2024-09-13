-- pgsql dialect --

BEGIN TRANSACTION;

CREATE TABLE blocks
(
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    blocked_at      TIMESTAMP DEFAULT now(),

    PRIMARY KEY (user_id, blocked_user_id)
);

-- Create a block for a user --
CREATE FUNCTION create_block(_user_id INTEGER, _blocked_user_id INTEGER) RETURNS VOID AS $$
BEGIN
    INSERT INTO blocks (user_id, blocked_user_id)
    VALUES (_user_id, _blocked_user_id);
END;
$$ LANGUAGE plpgsql;

-- Get all blocks for a user --
CREATE FUNCTION get_blocks_by_blocked_user_id(_blocked_user_id INTEGER) RETURNS SETOF blocks AS $$
BEGIN
    RETURN QUERY (
        SELECT *
        FROM blocks
        WHERE blocked_user_id = _blocked_user_id
    );
END;
$$ LANGUAGE plpgsql;

-- Delete a block by its ID --
CREATE FUNCTION delete_block(_user_id INTEGER, _blocked_user_id INTEGER) RETURNS VOID AS $$
BEGIN
    DELETE FROM blocks
    WHERE user_id = _user_id AND blocked_user_id = _blocked_user_id;
END;
$$ LANGUAGE plpgsql;

END TRANSACTION;