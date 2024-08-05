import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '@api/exceptions/UnauthorizedError';
import db from '@api/connections/database';

declare global {
    namespace Express {
        interface Request {
            user_id?: number;
        }
    }
}

export const SessionMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const token = req.cookies?.['session'];

    if (!token) {
        return next(new UnauthorizedError('Missing session token'));
    }

    try {
        const rows = await db.sql<{ user_id?: number }>(
            // language=SQL
            'SELECT verify_and_refresh_session($1) AS user_id',
            [token],
        );

        const user_id = rows[0].user_id;

        if (!user_id) {
            return new UnauthorizedError('Invalid session token');
        }

        req.user_id = user_id;

        return next();
    } catch (error) {
        res.clearCookie('session');

        if (error instanceof Error) {
            return next(new UnauthorizedError(error.message));
        }
        return next(new UnauthorizedError('Invalid session'));
    }
};
