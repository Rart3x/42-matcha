CREATE OR REPLACE FUNCTION create_registration(
    p_username TEXT,
    p_email TEXT,
    p_password TEXT,
    p_first_name TEXT,
    p_last_name TEXT
) RETURNS UUID AS
$$
DECLARE
    l_token UUID;
BEGIN
    -- check if user with given username or email already exists
    IF EXISTS (SELECT 1 FROM users WHERE username = p_username OR email = p_email) THEN
        RAISE EXCEPTION 'User with given username or email already exists';
    END IF;

    -- check if user with given username but different email already requested registration
    IF EXISTS (SELECT 1
               FROM users_registrations
               WHERE (username = p_username
                   OR email = p_email)
                 AND expires_at > now()) THEN
        RAISE EXCEPTION 'Username already requested with different email';
    END IF;

    INSERT INTO users_registrations (username, email, password, first_name, last_name)
    VALUES (p_username, p_email, hash_password(p_password), p_first_name, p_last_name)
    RETURNING token INTO l_token;

    RETURN l_token;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION username_exists(p_username TEXT) RETURNS BOOLEAN AS
$$
BEGIN
    RETURN EXISTS (SELECT 1 FROM users WHERE username = p_username)
        OR EXISTS (SELECT 1 FROM users_registrations WHERE username = p_username AND expires_at > now());
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION email_exists(p_email TEXT) RETURNS BOOLEAN AS
$$
BEGIN
    RETURN EXISTS (SELECT 1 FROM users WHERE email = p_email)
        OR EXISTS (SELECT 1 FROM users_registrations WHERE email = p_email AND expires_at > now());
END;
$$ LANGUAGE plpgsql;