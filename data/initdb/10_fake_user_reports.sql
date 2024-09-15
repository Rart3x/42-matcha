CREATE TABLE fake_user_reports
(
    user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    created_at       TIMESTAMP DEFAULT now(),

    PRIMARY KEY (user_id, reported_user_id)
);

-- -- Create a fake user report for a user --
-- CREATE FUNCTION create_fake_user_report(_user_id INTEGER, _reported_user_id INTEGER)
--     RETURNS VOID AS $$
-- BEGIN
-- INSERT INTO fake_user_reports (user_id, reported_user_id)
-- VALUES (_user_id, _reported_user_id);
-- END;
-- $$ LANGUAGE plpgsql;
--
-- -- Get all fake user reports for a user --
-- CREATE FUNCTION get_fake_user_reports_by_user_id(_user_id INTEGER) RETURNS SETOF fake_user_reports AS $$
-- BEGIN
-- RETURN QUERY
-- SELECT * FROM fake_user_reports WHERE user_id = _user_id;
-- END;
-- $$ LANGUAGE plpgsql;
--
-- -- Update the user fame rating on fake user reported --
-- CREATE TRIGGER update_fame_rating_on_fake_user_reported
--     AFTER INSERT ON fake_user_reports
--     FOR EACH ROW
--     EXECUTE FUNCTION update_fame_rating_on_reported();
--
-- -- Update the user fame rating on fake user unreported --
-- CREATE TRIGGER update_fame_rating_on_fake_user_unreported
--     AFTER DELETE ON fake_user_reports
--     FOR EACH ROW
--     EXECUTE FUNCTION update_fame_rating_on_unreported();
