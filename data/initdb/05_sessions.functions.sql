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

DROP FUNCTION IF EXISTS verify_and_refresh_session(UUID);

CREATE OR REPLACE FUNCTION verify_and_refresh_session(
    p_token UUID
)
    RETURNS INTEGER AS
$$
DECLARE
    l_user_id INTEGER;
BEGIN
    UPDATE sessions
    SET updated_at = NOW()
    WHERE sessions.token = p_token
      AND sessions.expires_at > NOW()
    RETURNING user_id INTO l_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid session';
    END IF;

    RETURN l_user_id;
END;
$$ LANGUAGE plpgsql;
