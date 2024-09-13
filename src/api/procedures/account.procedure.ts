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
        const email = validateEmail(params.email);
        const username = validateUsername(params.username);
        const password = validatePassword(params.password);
        const firstName = validateName(params.firstName);
        const lastName = validateName(params.lastName);

        // JOIN users ON users.username = ${username} OR users.email = ${email}
        const [registration]: [{ token: string }?] = await sql`
            INSERT INTO users_registrations (email, username, password, first_name, last_name)
            SELECT 
                ${email}, 
                ${username},
                crypt(${password}, gen_salt('bf', 8)),
                ${firstName}, 
                ${lastName}
            WHERE NOT EXISTS(
                SELECT 1
                FROM users
                    LEFT JOIN users_registrations as reg
                        ON (reg.username = ${username} OR reg.email = ${email})
                        AND reg.expires_at > NOW()
                WHERE users.username = ${username} OR users.email = ${email}
            )
            RETURNING token;
        `;

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
        const token = validateToken(params.token);

        const [user]: [{ username: string }?] = await sql`
            INSERT INTO users (email, username, password, first_name, last_name)
            SELECT email, username, password, first_name, last_name
            FROM users_registrations
            WHERE token = ${token}
                AND expires_at > NOW()
            RETURNING username;
        `;

        if (!user) {
            throw badRequest();
        }

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
        const username = validateUsername(params.username);

        const user_id = await usePrincipalUser().catch(() => null);

        const [user]: [{ exists: boolean }] = await sql`
            SELECT EXISTS(
                SELECT 1
                FROM users
                    LEFT JOIN users_registrations as reg
                        ON reg.username = ${username}
                        AND reg.expires_at > NOW()
                WHERE users.username = ${username}
                    AND users.id != ${user_id}
            ) as exists
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
        const email = validateEmail(params.email);

        const user_id = await usePrincipalUser().catch(() => null);

        const [user]: [{ exists: boolean }] = await sql`
            SELECT EXISTS(
                SELECT 1
                FROM users
                    LEFT JOIN users_registrations as reg
                        ON reg.email = ${email}
                        AND reg.expires_at > NOW()
                WHERE users.email = ${email}
                    AND users.id != ${user_id}
            ) as exists
        `;

        if (user.exists) {
            return { available: 'false' as const };
        }
        return { available: 'true' as const };
    },
);

export const updateEmailProcedure = procedure(
    'updateEmail',
    {} as { email: string },
    async (params) => {
        const email = validateEmail(params.email);

        const user_id = await usePrincipalUser();

        const { token, username } = await sql.begin(async (sql) => {
            const [existing]: [{ exists: boolean }] = await sql`
                SELECT EXISTS(
                    SELECT 1
                    FROM users, users_registrations
                    WHERE
                    (
                        users_registrations.email = ${email}
                        AND expires_at > NOW()
                    )
                    OR users.email = ${email}
                ) as exists
            `;

            if (existing.exists) {
                throw badRequest();
            }

            const [result]: [{ token: string }?] = await sql`
                INSERT INTO pending_email_modification(new_email, user_id)
                VALUES (${email}, ${user_id})
                RETURNING token
            `;

            if (!result) {
                throw badRequest();
            }

            const [user]: [{ username: string }?] = await sql`
                SELECT username
                FROM users
                WHERE id = ${user_id}
            `;

            if (!user) {
                throw badRequest();
            }

            return { token: result.token, username: user.username };
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
    {} as { password: string },
    async (params) => {
        const password = validatePassword(params.password);

        const user_id = await usePrincipalUser().catch(() => null);

        await sql`
            SET password = crypt(${password}, gen_salt('bf', 8))
            WHERE id = ${user_id}
        `;

        return { message: 'ok' };
    },
);
