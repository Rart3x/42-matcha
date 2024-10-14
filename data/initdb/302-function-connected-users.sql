--- Description: This function returns all users that are connected to a given user.
--- n.b. two users are connected if they share mutual likes.
CREATE OR REPLACE FUNCTION connected_users(principal_user_id INTEGER) RETURNS SETOF users AS
$$
SELECT other_user.*
  FROM reachable_users(principal_user_id) AS other_user
           INNER JOIN likes AS like_from_principal_user
           ON like_from_principal_user.liker_user_id = principal_user_id AND
              like_from_principal_user.liked_user_id = other_user.id
           INNER JOIN likes AS like_to_principal_user
           ON like_to_principal_user.liked_user_id = principal_user_id AND
              like_to_principal_user.liker_user_id = other_user.id
 WHERE other_user.id != principal_user_id
$$ LANGUAGE sql;