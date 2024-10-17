import { procedure } from '@api/lib/procedure';
import { validateEmail, validatePassword, validateToken } from '@api/validators/account.validators';
import { sql } from '@api/connections/database.connection';
import { badRequest } from '@api/errors/bad-request.error';
import { mailer } from '@api/connections/mailer.connection';

const HOST = process.env['APP_HOST'] || 'localhost';
const PORT = process.env['APP_PORT'] || '4200';

/**
 * This procedure is used to request a password reset.
 * It will email the user a link to reset their password.
 */
export const requirePasswordResetProcedure = procedure(
    'requirePasswordReset',
    {} as {
        email: string;
    },
    async (params) => {
        const email = await validateEmail(params.email);

        const [result]: [{ token: string; username: string }?] = await sql`
              WITH new_reset AS ( 
                  INSERT INTO pending_password_resets (user_id) SELECT users.id AS user_id
                      FROM users
                               -- Join with pending_password_resets to ensure that the user does not already have a pending reset
                               LEFT JOIN pending_password_resets
                               ON pending_password_resets.user_id =
                                  users.id AND
                                  pending_password_resets.expires_at >
                                  NOW()
                     WHERE email = ${email}
                       -- Exclude users who have already requested a password reset
                       AND pending_password_resets.token IS NULL 
                    RETURNING 
                        pending_password_resets.token AS token, 
                        pending_password_resets.user_id AS user_id
                )
            SELECT new_reset.token AS token, users.username AS username
              FROM new_reset
                       INNER JOIN users
                       ON users.id = new_reset.user_id;
        `;

        if (!result) {
            throw badRequest();
        }

        const { token, username } = result;

        const resetPasswordLink = `http://${HOST}:${PORT}/reset-password/${token}`;

        await mailer
            .sendMail({
                from: 'no-reply@matcha.com',
                to: email,
                subject: 'Password Reset',
                text: `Hi ${username}, please click the link to reset your password: ${resetPasswordLink}`,
            })
            .catch(() => {
                throw badRequest();
            });

        return { message: 'ok' };
    },
);

/**
 * This procedure performs the actual password reset.
 * It uses the token sent to the user to assert the user's identity.
 * It then updates the user's password.
 */
export const resetPasswordProcedure = procedure(
    'resetPassword',
    {} as {
        token: string;
        password: string;
    },
    async (params) => {
        const token = await validateToken(params.token);
        const password = await validatePassword(params.password);

        await sql.begin(async (sql) => {
            const [user] = await sql`
                     WITH user_to_update
                              AS ( DELETE FROM pending_password_resets WHERE token = ${token} AND expires_at > NOW() RETURNING user_id)
                   UPDATE users
                      SET password = crypt(${password}, gen_salt('bf'))
                     FROM user_to_update
                    WHERE users.id = user_to_update.user_id
                RETURNING users.id
            `;

            if (!user) {
                throw badRequest();
            }
        });

        return { message: 'ok' };
    },
);
