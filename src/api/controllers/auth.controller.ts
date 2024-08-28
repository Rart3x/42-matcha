import { Router } from 'express';
import { UnauthorizedError } from '@api/exceptions/UnauthorizedError';
import { SessionMiddleware } from '@api/middlewares/session.middleware';
import { sql } from '@api/connections/database';
import { badRequestResponse, isErrorResponse } from '@api/lib/procedure';

const AuthController = Router();

function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

AuthController.route('/auth/login').post(async (req, res, next) => {
    const { username, password } = req.body as {
        username?: string;
        password?: string;
    };

    await wait(4000);

    if (!username || !password) {
        return next(new UnauthorizedError('Missing username or password'));
    }

    try {
        const users = await sql.begin(async (sql) => {
            const users = await sql<{ id: string }[]>`
                SELECT id 
                FROM users 
                WHERE username = ${username} AND password = ${password}
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
            return new UnauthorizedError('Invalid username or password');
        }

        res.cookie('session', token, { httpOnly: true, sameSite: 'strict' });

        res.json({ message: 'login successful' });
    } catch (error) {
        if (error instanceof Error) {
            return next(new UnauthorizedError(error.message));
        }
        return next(new UnauthorizedError());
    }
});

AuthController.route('/auth/logout').post(SessionMiddleware, (req, res) => {
    res.clearCookie('session');
    res.json({ message: 'logout successful' });
});

AuthController.route('/auth/verify').get(SessionMiddleware, (req, res) => {
    res.status(200).json({ message: 'session verified' });
});

export { AuthController };
