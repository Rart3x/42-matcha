CREATE VIEW profile AS
SELECT users.id,
       users.username,
       users.first_name,
       users.last_name,
       users.biography,
       users.gender,
       users.sexual_pref,
       users.age,
       users.fame_rating,
       ARRAY_REMOVE(ARRAY_AGG(tags.name), NULL) AS tags -- array of tags for each user
FROM users
         LEFT JOIN users_tags ON users.id = users_tags.user_id
         LEFT JOIN tags ON tags.id = users_tags.tag_id
GROUP BY users.id;