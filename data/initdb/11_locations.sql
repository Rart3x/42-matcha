DROP TABLE IF EXISTS locations CASCADE;

CREATE TABLE locations
(
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    longitude       FLOAT NOT NULL,
    latitude        FLOAT NOT NULL,

    consented       BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY (user_id)
);