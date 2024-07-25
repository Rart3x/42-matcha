import { NextFunction, Request, Response } from 'express';

export const SessionMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    // TODO: implement session protection
    next();
};
