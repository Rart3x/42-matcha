CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

DROP FUNCTION IF EXISTS browse_users(principal_user_id INTEGER);

CREATE OR REPLACE FUNCTION browse_users(principal_user_id INTEGER,
                                        age INTEGER,
                                        minimum_rating INTEGER,
                                        minimum_common_tags INTEGER,
                                        maximum_location_gap FLOAT,
                                        order_by TEXT
) RETURNS SETOF users AS
$$
WITH
    principal_user AS (
        SELECT *
        FROM users
        WHERE
            id = principal_user_id
    ),
    common_tags    AS (
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
    ),
    age_gaps       AS (
        SELECT
            other_users.id                            AS other_user_id,
            ABS(principal_user.age - other_users.age) AS age_gap
        FROM users AS other_users
            CROSS JOIN principal_user
        WHERE
            other_users.id != principal_user.id
    ),
    location_gaps  AS (
        SELECT
            other_users.id     AS other_user_id,
            CASE WHEN (principal_user_location IS NULL OR other_user_location IS NULL) THEN NULL
                 ELSE earth_distance(ll_to_earth(principal_user_location.latitude, principal_user_location.longitude),
                                     ll_to_earth(other_user_location.latitude, other_user_location.longitude)) /
                      1000 END AS location_gap -- Distance in km
        FROM users AS other_users
            CROSS JOIN principal_user
            LEFT JOIN locations AS principal_user_location
                ON principal_user_location.user_id = principal_user.id
            LEFT JOIN locations AS other_user_location
                ON other_user_location.user_id = other_users.id
        WHERE
            other_users.id != principal_user.id
    )
SELECT
    other_users.*
FROM reachable_users(principal_user_id) AS other_users
    CROSS JOIN principal_user
    LEFT JOIN common_tags
        ON common_tags.other_user_id = other_users.id
    LEFT JOIN age_gaps
        ON age_gaps.other_user_id = other_users.id
    LEFT JOIN location_gaps
        ON location_gaps.other_user_id = other_users.id
WHERE
      -- Exclude principal user
      other_users.id != principal_user.id
      -- Filter by age (within 5 years of the principal user's age or the specified age)
  AND CASE WHEN browse_users.age IS NOT NULL THEN ABS(browse_users.age - other_users.age) < 5
           ELSE age_gap < 5 END
      -- Filter by minimum fame rating (if specified)
  AND CASE WHEN minimum_rating IS NOT NULL THEN other_users.fame_rating >= minimum_rating
           ELSE TRUE END
      -- Filter by minimum common tags (if specified)
  AND CASE WHEN minimum_common_tags IS NOT NULL THEN common_tags_count >= minimum_common_tags
           ELSE TRUE END
      -- Filter by maximum location gap (if specified)
  AND CASE WHEN maximum_location_gap IS NOT NULL THEN location_gap < maximum_location_gap
           ELSE TRUE END
      -- Filter by sexual preference
  AND CASE WHEN principal_user.sexual_pref = 'any' THEN TRUE
           ELSE principal_user.sexual_pref = other_users.gender END
  AND CASE WHEN other_users.sexual_pref = 'any' THEN TRUE
           ELSE other_users.sexual_pref = principal_user.gender END

ORDER BY
    -- Order by the specified column ASC
    CASE WHEN order_by = 'age'      THEN age_gap
         WHEN order_by = 'distance' THEN location_gap END,
    -- Order by the specified column DESC
    CASE WHEN order_by = 'fame_rating' THEN other_users.fame_rating
         WHEN order_by = 'common_tags' THEN common_tags_count END DESC,
    -- Default order by
    common_tags_count DESC,
    fame_rating DESC,
    age_gap,
    username,
    location_gap NULLS LAST;

$$ LANGUAGE SQL;