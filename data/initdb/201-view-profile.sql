CREATE VIEW profile AS
WITH
    principal_user AS (
        SELECT *
        FROM users
    ),
    other_user     AS (
        SELECT *
        FROM users
    )
SELECT

    other_user.id AS other_user_id,
    liked_by_principal.liker_user_id IS NOT NULL AS liked_by_principal,
    likes_principal.liker_user_id IS NOT NULL    AS likes_principal

FROM other_user
    -- whether the user is liked by the principal user
    LEFT JOIN likes AS liked_by_principal
        ON liked_by_principal.liker_user_id = principal_user.id AND liked_by_principal.liked_user_id = other_user.id
    -- whether the user has liked the principal user
    LEFT JOIN likes AS likes_principal
        ON likes_principal.liker_user_id = other_user.id AND likes_principal.liked_user_id = principal_user.id


SELECT * FROM profile
WHERE


-- CREATE VIEW profile AS
-- SELECT users.id,
--        users.username,
--        users.first_name,
--        users.last_name,
--        users.biography,
--        users.gender,
--        users.sexual_pref,
--        users.age,
--        users.fame_rating,
--        ARRAY_REMOVE(ARRAY_AGG(tags.name), NULL) AS tags -- array of tags for each user
-- FROM users
--          LEFT JOIN users_tags ON users.id = users_tags.user_id
--          LEFT JOIN tags ON tags.id = users_tags.tag_id
-- GROUP BY users.id;