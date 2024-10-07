--- Table: fake_user_reports
--- Table for storing fake user reports
CREATE TABLE fake_user_reports
(
    reporter_user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    reported_user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,

    created_at       TIMESTAMP DEFAULT now(),

    PRIMARY KEY (reporter_user_id, reported_user_id)
);