import { json, NextFunction, Request, Response, Router } from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { SessionMiddleware } from '@api/middlewares/session.middleware';
import { UnauthorizedError } from '@api/exceptions/UnauthorizedError';
import { AuthController } from '@api/controllers/auth.controller';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Configure root api router with global middlewares                                                                ///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const ApiRouter = Router();

ApiRouter.use(morgan('tiny')); // logger
ApiRouter.use(cookieParser()); // parse cookies
ApiRouter.use(json()); // parse json body

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Configure api routes                                                                                             ///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

ApiRouter.use('/', AuthController);

/**
 * @api {post} /register Create a new user registration, sending a confirmation email
 */
ApiRouter.post('/account/register', (req, res) => {
    // TODO: implement registration
    res.json({ message: 'register' });
});

/**
 * @api {post} /confirm/:token Confirm a user registration with a token, creating the user account
 */
ApiRouter.post('/account/confirm/:token', (req, res) => {
    // TODO: implement email confirmation
    res.json({ message: 'confirm' });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Configure session protected api routes                                                                           ///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const SessionProtectedApiRouter = Router();

SessionProtectedApiRouter.use(SessionMiddleware);

// TODO: implement session protected routes here

ApiRouter.use('/', SessionProtectedApiRouter);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Register global error handler.                                                                                   ///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

ApiRouter.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof UnauthorizedError) {
        return next(
            res.status(401).json({ type: err.name, message: err.message }),
        );
    }
    return next(res.sendStatus(400));
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Configure api connections                                                                                        ///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// TODO: implement database connection
// TODO: implement session store connection ( necessary ? )
// TODO: implement email connection

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Export the configured api router                                                                                 ///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export { ApiRouter };
