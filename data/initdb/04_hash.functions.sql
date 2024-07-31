CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION hash_password(
    p_password TEXT
)
    RETURNS TEXT AS
$$
BEGIN
    -- encode as sha256 hex digest
    RETURN encode(digest(p_password, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;
