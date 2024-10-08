--- This file is used to create triggers for notifications
--- The triggers are used to automatically create notifications when certain events occur
--- For example, when a user visits another user's profile, a notification is created

-- visits

CREATE OR REPLACE FUNCTION create_visit_notification() RETURNS TRIGGER AS
$$
DECLARE
    visited_user users%ROWTYPE;
    visiter_user users%ROWTYPE;
BEGIN
    SELECT *
    FROM users
    WHERE
        id = NEW.visited_user_id
    INTO visited_user;

    SELECT *
    FROM users
    WHERE
        id = NEW.visiter_user_id
    INTO visiter_user;

    INSERT INTO
        notifications (notified_user_id, type, content)
    VALUES
        (visited_user.id, 'visit', 'User ' || visiter_user.username || ' visited your profile');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER create_visit_notification
    AFTER INSERT
    ON visits
    FOR EACH ROW
EXECUTE FUNCTION create_visit_notification();

-- create likes

CREATE OR REPLACE FUNCTION create_like_notification() RETURNS TRIGGER AS
$$
DECLARE
    liked_user users%ROWTYPE;
    liker_user users%ROWTYPE;
BEGIN
    SELECT *
    FROM users
    WHERE
        id = NEW.liked_user_id
    INTO liked_user;

    SELECT *
    FROM users
    WHERE
        id = NEW.liker_user_id
    INTO liker_user;

    INSERT INTO
        notifications (notified_user_id, type, content)
    VALUES
        (liked_user.id, 'like', 'User ' || liker_user.username || ' liked your profile');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER create_like_notification
    AFTER INSERT
    ON likes
    FOR EACH ROW
EXECUTE FUNCTION create_like_notification();

-- remove likes

CREATE OR REPLACE FUNCTION remove_like_notification() RETURNS TRIGGER AS
$$
DECLARE
    liked_user users%ROWTYPE;
    liker_user users%ROWTYPE;
BEGIN
    SELECT *
    FROM users
    WHERE
        id = OLD.liked_user_id
    INTO liked_user;

    SELECT *
    FROM users
    WHERE
        id = OLD.liker_user_id
    INTO liker_user;

    INSERT INTO
        notifications (notified_user_id, type, content)
    VALUES
        (liked_user.id, 'unlike', 'User ' || liker_user.username || ' unliked your profile');

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER remove_like_notification
    AFTER DELETE
    ON likes
    FOR EACH ROW
EXECUTE FUNCTION remove_like_notification();

-- create matches

CREATE OR REPLACE FUNCTION create_match_notification() RETURNS TRIGGER AS
$$
DECLARE
    liked_user users%ROWTYPE;
    liker_user users%ROWTYPE;
    like_back  BOOLEAN;
BEGIN
    SELECT *
    FROM users
    WHERE
        id = NEW.liked_user_id
    INTO liked_user;

    SELECT *
    FROM users
    WHERE
        id = NEW.liker_user_id
    INTO liker_user;

    SELECT
        EXISTS(
            SELECT
                1
            FROM likes
            WHERE
                  likes.liker_user_id = liked_user.id
              AND likes.liked_user_id = liker_user.id
        )
    INTO like_back;

    IF like_back THEN
        INSERT INTO
            notifications (notified_user_id, type, content)
        VALUES
            (liked_user.id, 'match', 'It''s a match! You and ' || liker_user.username || ' liked each other');

        INSERT INTO
            notifications (notified_user_id, type, content)
        VALUES
            (liker_user.id, 'match', 'It''s a match! You and ' || liked_user.username || ' liked each other');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER create_match_notification
    AFTER INSERT
    ON likes
    FOR EACH ROW
EXECUTE FUNCTION create_match_notification();

-- create messages

CREATE OR REPLACE FUNCTION create_message_notification() RETURNS TRIGGER AS
$$
DECLARE
    sender_user   users%ROWTYPE;
    receiver_user users%ROWTYPE;
BEGIN
    SELECT *
    FROM users
    WHERE
        id = NEW.sender_id
    INTO sender_user;

    SELECT *
    FROM users
    WHERE
        id = NEW.receiver_id
    INTO receiver_user;

    INSERT INTO
        notifications (notified_user_id, type, content)
    VALUES
        (receiver_user.id, 'message', 'User ' || sender_user.username || ' sent you a message');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER create_message_notification
    AFTER INSERT
    ON messages
    FOR EACH ROW
EXECUTE FUNCTION create_message_notification();