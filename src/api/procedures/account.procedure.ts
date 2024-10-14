import { procedure } from '@api/lib/procedure';
import {
    validateEmail,
    validateName,
    validatePassword,
    validateToken,
    validateUsername,
} from '@api/validators/account.validators';
import { badRequest } from '@api/errors/bad-request.error';
import { mailer } from '@api/connections/mailer.connection';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { validateUserId } from '@api/validators/profile.validators';
import { getLatLngFromIp } from '@api/connections/geoip';
import { useGetIp } from '@api/hooks/ip.hooks';

const HOST = process.env['APP_HOST'] || 'localhost';
const PORT = process.env['APP_PORT'] || '4200';

/**
 * Register a new account.
 * @note This procedure does not create a user account, but rather a registration record.
 * @note The registration record shall be turned into a user account by confirming the email address.
 * with the `confirmEmail` procedure.
 */
export const registerAccountProcedure = procedure(
    'registerAccountProcedure',
    {} as {
        email: string;
        username: string;
        password: string;
        firstName: string;
        lastName: string;
    },
    async (params) => {
        const email = await validateEmail(params.email);
        const username = await validateUsername(params.username);
        const password = await validatePassword(params.password);
        const firstName = await validateName(params.firstName);
        const lastName = await validateName(params.lastName);

        const registration = await sql.begin(async (sql) => {
            await sql`
                -- Delete registration record with the same username if it has expired
                DELETE
                  FROM pending_user_registrations
                 WHERE (username = ${username} OR email = ${email})
                   AND expires_at < NOW();
            `;

            const [registration]: [{ token: string }?] = await sql`
                -- Create a new registration record failing if the username or email is already in use
                   INSERT INTO pending_user_registrations (email, username, password, first_name, last_name)
                   SELECT ${email}, ${username}, crypt(${password}, gen_salt('bf', 8)), ${firstName}, ${lastName}
                RETURNING token;
            `;

            return registration;
        });

        if (!registration) {
            throw badRequest();
        }

        const confirmationLink = `http://${HOST}:${PORT}/confirm-email/${registration.token}`;

        await mailer
            .sendMail({
                from: 'no-reply@matcha.com',
                to: email,
                subject: 'Matcha Registration',
                text: `Hi ${username}, please click the link to confirm your registration: ${confirmationLink}`,
            })
            .catch(() => {
                throw badRequest();
            });

        return { message: 'ok' };
    },
);

/**
 * Confirm email address.
 * @note Turns a registration into a user account.
 */
export const confirmEmailProcedure = procedure(
    'confirmEmail',
    {} as { token: string },
    async (params) => {
        const token = await validateToken(params.token);
        const ip = useGetIp();

        const location = ip ? await getLatLngFromIp(ip) : null;

        if (!location) {
            throw badRequest();
        }

        const user = await sql.begin(async (sql) => {
            const [user]: [{ username: string; id: string }?] = await sql`
                -- Create a new user from the registration record
                   INSERT INTO users (email, username, password, first_name, last_name)
                   SELECT email, username, password, first_name, last_name
                     FROM pending_user_registrations
                    WHERE token = ${token}
                      AND expires_at > NOW()
                RETURNING username, id;
            `;

            if (!user) {
                throw badRequest();
            }

            await sql`
                -- Delete the registration record after creating the user
                -- and delete any expired registration records
                DELETE
                  FROM pending_user_registrations
                 WHERE token = ${token}
                    OR expires_at < NOW();
            `;

            await sql`
                -- Create a new location record for the user
                INSERT INTO locations (user_id, latitude, longitude, is_consented)
                VALUES (${user.id}, ${location.lat}, ${location.lng}, FALSE);
            `;

            return user;
        });

        return { username: user.username };
    },
);

/**
 * Check if a username is available (for registration purposes)
 * @note Provides better UX by checking username availability before submitting the registration form.
 */
export const usernameAvailableProcedure = procedure(
    'usernameAvailable',
    {} as { username: string },
    async (params) => {
        const username = await validateUsername(params.username);

        const user_id = await usePrincipalUser().catch(() => null); // Catch the error if the user is not authenticated

        const [user]: [{ exists: boolean }] = await sql`
            -- Check if the username is already in use by a user or a pending registration
            SELECT EXISTS(SELECT 1
                            FROM (SELECT 1
                                    FROM users
                                   WHERE username = ${username}
                                     AND id != ${user_id}
                                   UNION ALL
                                  SELECT 1
                                    FROM pending_user_registrations
                                   WHERE username = ${username}
                                     AND expires_at > NOW())) AS exists;
        `;

        if (user.exists) {
            return { available: 'false' as const };
        }
        return { available: 'true' as const };
    },
);

/**
 * Check if an email is available (for registration purposes)
 * @note Provides better UX by checking email availability before submitting the registration form.
 */
export const emailAvailableProcedure = procedure(
    'emailAvailable',
    {} as { email: string },
    async (params) => {
        const email = await validateEmail(params.email);

        const user_id = await usePrincipalUser().catch(() => null); // Catch the error if the user is not authenticated

        const [user]: [{ exists: boolean }] = await sql`
            -- Check if the email is already in use by a user, a pending registration, or a pending email modification
            SELECT EXISTS(SELECT 1
                            FROM (SELECT 1
                                    FROM users
                                   WHERE email = ${email}
                                     AND id != ${user_id}
                                   UNION ALL
                                  SELECT 1
                                    FROM pending_user_registrations
                                   WHERE email = ${email}
                                     AND expires_at > NOW()
                                   UNION ALL
                                  SELECT 1
                                    FROM pending_email_modifications
                                   WHERE new_email = ${email}
                                     AND expires_at > NOW())) AS exists;
        `;

        if (user.exists) {
            return { available: 'false' as const };
        }
        return { available: 'true' as const };
    },
);

export const getEmailProcedure = procedure('getEmail', async () => {
    const user_id = await usePrincipalUser();

    const [user]: [{ email: string }?] = await sql`
        -- Get the email of the authenticated user
        SELECT email
          FROM users
         WHERE id = ${user_id}
    `;

    if (!user) {
        throw badRequest();
    }

    return { email: user.email };
});

export const updateEmailProcedure = procedure(
    'updateEmail',
    {} as { email: string },
    async (params) => {
        const email = await validateEmail(params.email);

        const user_id = await usePrincipalUser();

        const { token, username } = await sql.begin(async (sql) => {
            const [conflicting_user]: [{ exists: boolean }] = await sql`
                -- Check if the email is already in use by a user, a pending registration, or a pending email modification
                SELECT EXISTS(SELECT 1
                                FROM (SELECT 1
                                        FROM users
                                       WHERE email = ${email}
                                         AND id != ${user_id}
                                       UNION ALL
                                      SELECT 1
                                        FROM pending_user_registrations
                                       WHERE email = ${email}
                                         AND expires_at > NOW()
                                       UNION ALL
                                      SELECT 1
                                        FROM pending_email_modifications
                                       WHERE new_email = ${email}
                                         AND expires_at > NOW())) AS exists;
            `;

            if (conflicting_user.exists) {
                throw badRequest();
            }

            const [result]: [{ token: string; username: string }?] = await sql`
                -- Create a new email modification record failing if the email is already in use
                   INSERT INTO pending_email_modifications(new_email, user_id)
                   SELECT ${email}, ${user_id}
                RETURNING token AS token, (SELECT username FROM users WHERE id = ${user_id}) AS username;
            `;

            if (!result) {
                throw badRequest();
            }

            return { token: result.token, username: result.username };
        });

        const confirmationLink = `http://${HOST}:${PORT}/confirm-email-modification/${token}`;

        await mailer
            .sendMail({
                from: 'no-reply@matcha.com',
                to: email,
                subject: 'Email Modification',
                text: `Hi ${username}, please click the link to confirm your new email: ${confirmationLink}`,
            })
            .catch(() => {
                throw badRequest();
            });

        return { message: 'ok' };
    },
);

export const updatePasswordProcedure = procedure(
    'updatePassword',
    {} as {
        old_password: string;
        password: string;
    },
    async (params) => {
        const user_id = await usePrincipalUser();

        const old_password = await validatePassword(params.old_password);
        const new_password = await validatePassword(params.password);

        const res = await sql`
            -- Update the password of the authenticated user if the old password is correct
               UPDATE users
                  SET password = crypt(${new_password}, gen_salt('bf', 8))
                WHERE id = ${user_id}
                  AND password = crypt(${old_password}, password)
            RETURNING id
        `;

        if (res.count === 0) {
            throw badRequest();
        }

        return { message: 'ok' };
    },
);

export const confirmEmailModificationProcedure = procedure(
    'confirmEmailModification',
    {} as {
        token: string;
    },
    async (params) => {
        const token = await validateToken(params.token);

        const user = await sql.begin(async (sql) => {
            const [user]: [{ username: string }?] = await sql`
                -- Update the email of the user from the email modification record
                   UPDATE users
                      SET email = pending_email_modifications.new_email
                     FROM pending_email_modifications
                    WHERE pending_email_modifications.token = ${token}
                      AND pending_email_modifications.expires_at > NOW()
                      AND pending_email_modifications.user_id = users.id
                RETURNING users.username AS username;
            `;

            if (!user) {
                throw badRequest();
            }

            await sql`
                -- Delete the email modification record after updating the user's email
                -- and delete any expired email modification records
                DELETE
                  FROM pending_email_modifications
                 WHERE token = ${token}
                    OR expires_at < NOW();
            `;

            return user;
        });

        return { username: user.username };
    },
);

export const getOnlineStatusByIdProcedure = procedure(
    'getOnlineStatusById',
    {} as {
        user_id: number;
    },
    async (params) => {
        void (await usePrincipalUser());

        const user_id = await validateUserId(params.user_id);

        const [session]: [{ online: boolean; last_seen: string; username: string }] = await sql`
            -- Check if the user is online and get the last seen time
            SELECT CASE WHEN sessions IS NULL THEN FALSE
                        ELSE sessions.updated_at > NOW() - INTERVAL '5 minutes' END AS online,
                   sessions.updated_at AS last_seen, users.username
              FROM users
                       LEFT JOIN sessions
                       ON users.id = sessions.user_id AND sessions.expires_at > NOW()
             WHERE users.id = ${user_id}
             ORDER BY sessions.updated_at DESC
        `;

        const last_seen = session.last_seen
            ? new Date(session.last_seen).toLocaleString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: 'short',
              })
            : 'more than 3 days ago';

        return { online: session.online, last_seen, username: session.username };
    },
);
