import { Router } from 'express';
import db from '@api/connections/database';
import { UnauthorizedError } from '@api/exceptions/UnauthorizedError';
import { SessionMiddleware } from '@api/middlewares/session.middleware';

const AuthController = Router();

AuthController.route('/auth/login').post(async (req, res, next) => {
    const { username, password } = req.body as {
        username?: string;
        password?: string;
    };

    if (!username || !password) {
        return next(new UnauthorizedError('Missing username or password'));
    }

    try {
        const rows = await db.sql<{ session_token?: string }>(
            // language=SQL
            'SELECT create_session_from_credentials($1, $2) AS session_token',
            [username, password],
        );

        const token = rows[0].session_token;

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
    res.sendStatus(200);
});

export { AuthController };
