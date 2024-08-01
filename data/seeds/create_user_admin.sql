DELETE
FROM users
WHERE email = 'admin@localhost';

INSERT INTO users (email, password, username, first_name, last_name)
VALUES ('admin@localhost', hash_password('password'), 'admin', 'Admin', 'User');