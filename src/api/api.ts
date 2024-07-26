import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { SessionMiddleware } from '@api/middlewares/session.middleware';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Configure root api router with global middlewares                                                                ///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const ApiRouter = express.Router();

ApiRouter.use(morgan('tiny')); // logger
ApiRouter.use(cookieParser()); // parse cookies
ApiRouter.use(express.json()); // parse json body

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Configure api routes                                                                                             ///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @api {post} /auth/login Exchange username and password from request body for a session cookie
 */
ApiRouter.post('/auth/login', (req, res) => {
    // TODO: implement login
    res.json({ message: 'login' });
});

/**
 * @api {get} /auth/logout Clear the session cookie
 */
ApiRouter.get('/auth/logout', SessionMiddleware, (req, res) => {
    // TODO: implement logout
    res.json({ message: 'logout' });
});

/**
 * @api {get} /auth/verify Check if the session cookie is valid
 */
ApiRouter.get('/auth/verify', SessionMiddleware, (req, res) => {
    res.sendStatus(401);
    // res.send({ message: 'OK' });
});

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

const SessionProtectedApiRouter = express.Router();

SessionProtectedApiRouter.use(SessionMiddleware);

// TODO: implement session protected routes here

ApiRouter.use('/', SessionProtectedApiRouter);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Register global error handler.                                                                                   ///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

ApiRouter.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.sendStatus(400);
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
