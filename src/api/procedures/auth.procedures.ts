import {
    badRequestResponse,
    isErrorResponse,
    successResponse,
    unauthorizedProcedure,
} from '@api/lib/procedure';
import { sql } from '@api/connections/database';

export const loginProcedure = unauthorizedProcedure(
    'login',
    async (
        { username, password }: { username: string; password: string },
        { setCookie },
    ) => {
        if (!username || !password) {
            return badRequestResponse('Invalid username or password');
        }

        const users = await sql.begin(async (sql) => {
            const users = await sql<{ id: string }[]>`
                SELECT id 
                FROM users 
                WHERE username = ${username} AND password = hash_password(${password})
            `;

            if (users.length === 0) {
                return badRequestResponse('Invalid username or password');
            }

            const sessions = await sql<{ token: string }[]>`
                INSERT INTO sessions (user_id)
                VALUES (${users[0].id})
                RETURNING token
            `;

            if (sessions.length === 0) {
                return badRequestResponse('Failed to create session');
            }

            return sessions[0].token;
        });

        if (isErrorResponse(users)) {
            return users;
        }

        const token = users[0];

        if (!token) {
            return badRequestResponse('Invalid username or password');
        }

        setCookie('session', token, {
            httpOnly: true,
            sameSite: 'strict',
        });

        return successResponse({ message: 'logged in' });
    },
);
