--- Table: notifications
--- Table for storing notifications
CREATE TABLE notifications
(
    id               INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

    notified_user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,

    type             TEXT    NOT NULL,
    content          TEXT    NOT NULL,
    is_viewed        BOOLEAN   DEFAULT FALSE,

    created_at       TIMESTAMP DEFAULT now(),
    updated_at       TIMESTAMP DEFAULT now()
);

-- TODO: review

-- Create a notification for a user --
CREATE FUNCTION create_notification(_user_id INTEGER, _type TEXT, _content TEXT) RETURNS VOID AS
$$
BEGIN
    INSERT INTO notifications (notified_user_id, type, content)
    VALUES (_user_id, _type, _content);
END;
$$ LANGUAGE plpgsql;

-- Get all notifications for a user --
CREATE FUNCTION get_notifications_by_user_id(_user_id INTEGER) RETURNS SETOF notifications AS
$$
BEGIN
    RETURN QUERY
        SELECT *
        FROM notifications
        WHERE notified_user_id = _user_id
        ORDER BY created_at DESC
        LIMIT 25;
END;
$$ LANGUAGE plpgsql;

-- Mark a notification as viewed --
CREATE FUNCTION mark_notification_as_view(_notification_id INTEGER) RETURNS VOID AS
$$
BEGIN
    UPDATE notifications SET is_viewed = TRUE WHERE id = _notification_id;
END;
$$ LANGUAGE plpgsql;

-- Mark all notifications as viewed for a user --
CREATE FUNCTION mark_all_notifications_as_view(_user_id INTEGER) RETURNS VOID AS
$$
BEGIN
    UPDATE notifications SET is_viewed = TRUE WHERE notified_user_id = _user_id;
END;
$$ LANGUAGE plpgsql;

-- Delete a notification --
CREATE FUNCTION delete_notifications(_notification_id INTEGER) RETURNS VOID AS
$$
BEGIN
    DELETE FROM notifications WHERE id = _notification_id;
END;
$$ LANGUAGE plpgsql;
