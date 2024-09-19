--- Table: locations
--- Table for storing the locations of users
CREATE TABLE locations
(
    id           INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

    user_id      INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,

    longitude    FLOAT   NOT NULL,
    latitude     FLOAT   NOT NULL,

    is_consented BOOLEAN NOT NULL DEFAULT FALSE
);