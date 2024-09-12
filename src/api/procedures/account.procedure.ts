import { procedure } from '@api/lib/procedure';
import {
    validateEmail,
    validateName,
    validatePassword,
    validateUsername,
} from '@api/validators/account.validators';
import { sql } from '../../api-old/connections/database';
import { badRequest } from '@api/errors/bad-request.error';

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

        return { token: registration.token };
    },
);
