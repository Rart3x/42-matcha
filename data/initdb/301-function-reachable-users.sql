--- Description: This function returns all users that are reachable by a given user.
--- n.b. A user is reachable if they have not blocked the principal user, the principal user has not blocked them,
---      the principal user has not reported them, and they have not reported the principal user.
CREATE OR REPLACE FUNCTION reachable_users(principal_user_id INTEGER) RETURNS SETOF users AS
$$
SELECT
    users.*
FROM users
    -- Whether blocked by principal
    LEFT JOIN blocks AS blocked_by_principal
        ON blocked_by_principal.blocked_user_id = users.id AND blocked_by_principal.blocker_user_id = principal_user_id
    -- Whether principal is blocked by user
    LEFT JOIN blocks AS blocks_principal
        ON blocks_principal.blocked_user_id = principal_user_id AND blocks_principal.blocker_user_id = users.id

    -- Whether principal is reported by user
    LEFT JOIN fake_user_reports AS reported_by_principal
        ON reported_by_principal.reported_user_id = principal_user_id AND
           reported_by_principal.reporter_user_id = users.id
    -- Whether user is reported by principal
    LEFT JOIN fake_user_reports AS reported_principal
        ON reported_principal.reported_user_id = users.id AND reported_principal.reporter_user_id = principal_user_id
WHERE
      -- exclude the principal user
      users.id != principal_user_id
      -- exclude users that have been blocked by the principal user
  AND blocked_by_principal.blocked_user_id IS NULL
      -- exclude users that have blocked the principal user
  AND blocks_principal.blocked_user_id IS NULL
      -- exclude users that have been reported by the principal user
  AND reported_by_principal.reported_user_id IS NULL
      -- exclude users that have reported the principal user
  AND reported_principal.reported_user_id IS NULL;
$$ LANGUAGE SQL;