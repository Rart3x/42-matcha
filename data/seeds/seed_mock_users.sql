
-- this script aims at inserting mock to test browsing feature
-- emails are unique and auto incremented

INSERT INTO users (email, password, username, first_name, last_name, age)
VALUES ('email1@mail.com', crypt('Password1234@', gen_salt('bf',8)), 'dan', 'Dan', 'Brown', 25),
         ('email2@mail.com', crypt('Password1234@', gen_salt('bf',8)), 'jane', 'Jane', 'Doe', 29),
         ('email3@mail.com', crypt('Password1234@', gen_salt('bf',8)), 'john', 'John', 'Doe' , 35),
         ('email4@mail.com', crypt('Password1234@', gen_salt('bf',8)), 'Bob', 'Bob', 'Smith' , 40),
       ('email5@mail.com', crypt('Password1234@', gen_salt('bf',8)), 'Alice', 'Alice', 'Smith' , 26),
       ('email6@mail.com', crypt('Password1234@', gen_salt('bf',8)), 'Charlie', 'Charlie', 'Smith' , 27),
       ('email7@mail.com', crypt('Password1234@', gen_salt('bf',8)), 'David', 'David', 'Smith' , 28),
       ('email8@mail.com', crypt('Password1234@', gen_salt('bf',8)), 'Eve', 'Eve', 'Smith' , 29),
      ('email9@mail.com', crypt('Password1234@', gen_salt('bf',8)), 'Frank', 'Frank', 'Smith' , 30),
      ('email10@mail.com', crypt('Password1234@', gen_salt('bf',8)), 'Grace', 'Grace', 'Smith' , 31),
      ('email11@mail.com', crypt('Password1234@', gen_salt('bf',8)), 'Helen', 'Helen', 'Smith' , 32),
      ('email12@mail.com', crypt('Password1234@', gen_salt('bf',8)), 'Ivy', 'Ivy', 'Smith' , 33),
      ('email13@mail.com', crypt('Password1234@', gen_salt('bf',8)), 'Jack', 'Jack', 'Smith' , 34),
      ('email14@mail.com', crypt('Password1234@', gen_salt('bf',8)), 'Kelly', 'Kelly', 'Smith' , 35),
      ('email15@mail.com', crypt('Password1234@', gen_salt('bf',8)), 'Liam', 'Liam', 'Smith' , 36),
      ('email16@mail.com', crypt('Password1234@', gen_salt('bf',8)), 'Mia', 'Mia', 'Smith' , 37),
      ('email17@mail.com', crypt('Password1234@', gen_salt('bf',8)), 'Nina', 'Nina', 'Smith' , 38),
      ('email18@mail.com', crypt('Password1234@', gen_salt('bf',8)), 'Oscar', 'Oscar', 'Smith' , 39),
      ('email19@mail.com', crypt('Password1234@', gen_salt('bf',8)), 'Pam', 'Pam', 'Smith' , 40),
      ('email20@mail.com', crypt('Password1234@', gen_salt('bf',8)), 'Quinn', 'Quinn', 'Smith' , 41)
ON CONFLICT DO NOTHING;

INSERT INTO users_tags (user_id, tag_id)
SELECT users.id, tags.id
FROM users
JOIN tags ON tags.name = 'dance'
WHERE username IN ('jane', 'Alice', 'Eve')
ON CONFLICT DO NOTHING;

INSERT INTO users_tags (user_id, tag_id)
SELECT users.id, tags.id
FROM users
JOIN tags ON tags.name = 'music'
WHERE username IN ('dan', 'Bob', 'Charlie', 'David', 'Frank', 'Grace', 'Helen', 'Ivy', 'Jack', 'Kelly', 'Liam', 'Mia', 'Nina', 'Oscar', 'Pam', 'Quinn')
ON CONFLICT DO NOTHING;

INSERT INTO users_tags (user_id, tag_id)
SELECT users.id, tags.id
FROM users
JOIN tags ON tags.name = 'sports'
WHERE username IN ('jane')
ON CONFLICT DO NOTHING;