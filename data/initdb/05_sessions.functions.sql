DROP FUNCTION IF EXISTS create_session_from_credentials(TEXT, TEXT);

CREATE OR REPLACE FUNCTION create_session_from_credentials(
    p_username TEXT,
    p_password TEXT
)
    RETURNS UUID AS
$$
DECLARE
    l_user_id INTEGER;
    l_token   UUID;
BEGIN
    SELECT id
    INTO l_user_id
    FROM users
    WHERE users.username = p_username
      AND users.password = hash_password(p_password);

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid credentials';
    END IF;

    INSERT INTO sessions (user_id)
    VALUES (l_user_id)
    RETURNING sessions.token INTO l_token;

    RETURN l_token;
END;
$$ LANGUAGE plpgsql;
