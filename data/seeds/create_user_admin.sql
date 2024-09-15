DELETE
FROM users
WHERE email = 'admin@localhost.com';

INSERT INTO users (email, password, username, first_name, last_name, age, gender, sexual_pref)
VALUES ('admin@localhost.com', crypt('Password1234@', gen_salt('bf', 8)), 'admin', 'Admin', 'User', 26, 'male',
        'female');

INSERT INTO users_tags (user_id, tag_id)
SELECT users.id, tags.id
FROM users
         JOIN tags ON tags.name = 'dance'
WHERE username IN ('admin')
ON CONFLICT DO NOTHING;

INSERT INTO users_tags (user_id, tag_id)
SELECT users.id, tags.id
FROM users
         JOIN tags ON tags.name = 'music'
WHERE username IN ('admin')
ON CONFLICT DO NOTHING;

INSERT INTO users_tags (user_id, tag_id)
SELECT users.id, tags.id
FROM users
         JOIN tags ON tags.name = 'sports'
WHERE username IN ('admin')
ON CONFLICT DO NOTHING;