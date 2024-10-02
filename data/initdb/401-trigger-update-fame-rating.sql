--- Description: This function is used to add a delta to the fame rating of a user when a trigger is fired.
CREATE OR REPLACE FUNCTION update_fame_rating_trigger() RETURNS TRIGGER AS
$$
DECLARE
    use_id_column_name TEXT := TG_ARGV[0]::TEXT;
    fame_rating_delta  TEXT := TG_ARGV[1]::TEXT;
    user_id            INTEGER;
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        EXECUTE FORMAT('SELECT ($1).%I', use_id_column_name) INTO user_id USING NEW;
    ELSE
        EXECUTE FORMAT('SELECT ($1).%I', use_id_column_name) INTO user_id USING OLD;
    END IF;

    UPDATE users
    SET
        fame_rating = fame_rating + CAST(fame_rating_delta AS INTEGER)
    WHERE
        id = user_id;

    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN RETURN NEW; ELSE RETURN OLD; END IF;
END;
$$ LANGUAGE plpgsql;


------------------------------------------------------------------------------------------------------------------------


--- Description: Upgrades the fame rating of a user when a like is inserted.
CREATE OR REPLACE TRIGGER upgrade_fame_rating_trigger
    AFTER INSERT
    ON likes
    FOR EACH ROW
EXECUTE FUNCTION update_fame_rating_trigger('liked_user_id', '1');

--- Description: Downgrades the fame rating of a user when a like is deleted.
CREATE OR REPLACE TRIGGER downgrade_fame_rating_trigger
    AFTER DELETE
    ON likes
    FOR EACH ROW
EXECUTE FUNCTION update_fame_rating_trigger('liked_user_id', '-1');