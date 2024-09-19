--- Table: fake_user_reports
--- Table for storing fake user reports
CREATE TABLE fake_user_reports
(
    reporter_user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    reported_user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,

    created_at       TIMESTAMP DEFAULT now(),

    PRIMARY KEY (reporter_user_id, reported_user_id)
);


-- TODO: review the following triggers

-- Update the user fame rating on fake user reported --
CREATE TRIGGER update_fame_rating_on_fake_user_reported
    AFTER INSERT
    ON fake_user_reports
    FOR EACH ROW
EXECUTE FUNCTION update_fame_rating_on_reported();

-- Update the user fame rating on fake user unreported --
CREATE TRIGGER update_fame_rating_on_fake_user_unreported
    AFTER DELETE
    ON fake_user_reports
    FOR EACH ROW
EXECUTE FUNCTION update_fame_rating_on_unreported();
