--- Description: This function is used to search for users based on the principal user's preferences.
CREATE OR REPLACE FUNCTION search_users(
    principal_user_id INTEGER,
    maximum_age_gap INTEGER,
    maximum_fame_rating_gap INTEGER,
    maximum_distance FLOAT,
    required_tags TEXT[],
    order_by TEXT
) RETURNS
    SETOF users
AS
$$
WITH
    principal_user      AS (
        SELECT *
        FROM users
        WHERE
            id = principal_user_id
    ),
    age_gaps            AS (
        SELECT
            other_users.id                            AS other_user_id,
            ABS(principal_user.age - other_users.age) AS age_gap
        FROM users AS other_users
            CROSS JOIN principal_user
        WHERE
            other_users.id != principal_user.id
    ),
    fame_rating_gaps    AS (
        SELECT
            other_users.id                                            AS other_user_id,
            ABS(principal_user.fame_rating - other_users.fame_rating) AS fame_rating_gap
        FROM users AS other_users
            CROSS JOIN principal_user
        WHERE
            other_users.id != principal_user.id
    ),
    distances           AS (
        SELECT
            other_users.id     AS other_user_id,
            CASE WHEN (principal_user_location IS NULL OR other_user_location IS NULL) THEN NULL
                 ELSE earth_distance(ll_to_earth(principal_user_location.latitude, principal_user_location.longitude),
                                     ll_to_earth(other_user_location.latitude, other_user_location.longitude)) /
                      1000 END AS distance -- Distance in km
        FROM users AS other_users
            CROSS JOIN principal_user
            LEFT JOIN locations AS principal_user_location
                ON principal_user_location.user_id = principal_user.id
            LEFT JOIN locations AS other_user_location
                ON other_user_location.user_id = other_users.id
        WHERE
            other_users.id != principal_user.id
    ),
    required_tags_count AS (
        SELECT
            other_users.id          AS other_user_id,
            COUNT(matching_tags.id) AS count
        FROM users AS other_users
            CROSS JOIN principal_user
            LEFT JOIN users_tags
                ON users_tags.user_id = other_users.id
            LEFT JOIN tags AS matching_tags
                ON matching_tags.id = users_tags.tag_id AND matching_tags.name = ANY (required_tags)
        WHERE
            other_users.id != principal_user.id
        GROUP BY
            other_users.id
    ),
    common_tags         AS (
        SELECT
            other_users.id            AS other_user_id,
            COUNT(common_tags.tag_id) AS common_tags_count
        FROM users AS other_users
            CROSS JOIN principal_user
            LEFT JOIN users_tags AS user_tags
                ON user_tags.user_id = other_users.id
            LEFT JOIN users_tags AS common_tags
                ON common_tags.tag_id = user_tags.tag_id AND common_tags.user_id = principal_user.id
        WHERE
            other_users.id != principal_user.id
        GROUP BY
            other_users.id
    )
SELECT
    other_users.*
FROM reachable_users(principal_user_id) AS other_users
    CROSS JOIN principal_user
    LEFT JOIN age_gaps
        ON age_gaps.other_user_id = other_users.id
    LEFT JOIN fame_rating_gaps
        ON fame_rating_gaps.other_user_id = other_users.id
    LEFT JOIN distances
        ON distances.other_user_id = other_users.id
    LEFT JOIN required_tags_count
        ON required_tags_count.other_user_id = other_users.id
    LEFT JOIN common_tags
        ON common_tags.other_user_id = other_users.id
WHERE
      --- Apply user dynamic preferences
      CASE WHEN maximum_age_gap IS NULL THEN TRUE
           ELSE age_gaps.age_gap <= maximum_age_gap END
  AND CASE WHEN maximum_fame_rating_gap IS NULL THEN TRUE
           ELSE fame_rating_gaps.fame_rating_gap <= maximum_fame_rating_gap END
  AND CASE WHEN maximum_distance IS NULL THEN TRUE
           ELSE distances.distance <= maximum_distance END
  AND CASE WHEN required_tags IS NULL THEN TRUE
           ELSE required_tags_count.count = COALESCE(ARRAY_LENGTH(required_tags, 1), 0) END
--     Apply sexual preferences
  AND CASE WHEN principal_user.sexual_pref = 'any' THEN TRUE
           ELSE principal_user.sexual_pref = other_users.gender END
  AND CASE WHEN other_users.sexual_pref = 'any' THEN TRUE
           ELSE other_users.sexual_pref = principal_user.gender END
ORDER BY
    CASE WHEN order_by = 'age'         THEN age_gaps.age_gap
         WHEN order_by = 'fame_rating' THEN fame_rating_gaps.fame_rating_gap
         WHEN order_by = 'distance'    THEN distances.distance END NULLS LAST,
    CASE WHEN order_by = 'common_tags' THEN common_tags.common_tags_count END DESC NULLS LAST,
    other_users.username

$$ LANGUAGE SQL;