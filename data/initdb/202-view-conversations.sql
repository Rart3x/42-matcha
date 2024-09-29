--- Create a view that lists all conversations between users, with the latest message in each conversation
--- Ordered by the date of the last message, with the most recent conversations first
CREATE OR REPLACE VIEW conversations AS
WITH
    reciprocal_likes AS (
        SELECT
            l1.liker_user_id AS principal_user_id,
            l1.liked_user_id AS other_user_id
        FROM
            likes l1
                JOIN likes l2
                    ON l1.liker_user_id = l2.liked_user_id AND l1.liked_user_id = l2.liker_user_id
    ),
    latest_messages  AS (
        SELECT
            sender_id,
            receiver_id,
            message,
            created_at,
            ROW_NUMBER()
            OVER ( PARTITION BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id) ORDER BY created_at DESC ) AS rn
        FROM
            messages
    )
SELECT DISTINCT
    principal_user_id,
    other_user.id                   AS other_user_id,
    other_user.username             AS other_username,
    COALESCE(sender.username, NULL) AS last_message_sender,
    COALESCE(lm.message, NULL)      AS last_message_content,
    COALESCE(lm.created_at, NULL)   AS last_message_date
FROM
    reciprocal_likes rl
        LEFT JOIN latest_messages lm
            ON rl.principal_user_id = LEAST(lm.sender_id, lm.receiver_id) AND
               rl.other_user_id = GREATEST(lm.sender_id, lm.receiver_id) AND lm.rn = 1 -- Only take the latest message
        LEFT JOIN users AS other_user
            ON other_user.id = rl.other_user_id
        LEFT JOIN users AS sender
            ON sender.id = lm.sender_id
ORDER BY
    last_message_date DESC NULLS LAST,
    other_username;
