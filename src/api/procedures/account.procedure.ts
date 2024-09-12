import { procedure } from '@api/lib/procedure';
import {
    validateEmail,
    validateName,
    validatePassword,
    validateToken,
    validateUsername,
} from '@api/validators/account.validators';
import { sql } from '../../api-old/connections/database';
import { badRequest } from '@api/errors/bad-request.error';
import { mailer } from '@api/connections/mailer.connection';

const HOST = process.env['APP_HOST'] || 'localhost';
const PORT = process.env['APP_PORT'] || '4200';

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
