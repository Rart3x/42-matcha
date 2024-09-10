DELETE
FROM users
WHERE email = 'admin@localhost.com';

INSERT INTO users (email, password, username, first_name, last_name)
VALUES ('admin@localhost.com', crypt('Password1234@', gen_salt('bf',8)), 'admin', 'Admin', 'User');