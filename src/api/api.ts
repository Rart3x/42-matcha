import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Configure root api router with global middlewares                                                                ///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const ApiRouter = express.Router();

ApiRouter.use(morgan('tiny')); // logger
ApiRouter.use(cookieParser()); // parse cookies
ApiRouter.use(express.json()); // parse json body

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Configure public api routes                                                                                      ///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const PublicApiRouter = express.Router();

/**
 * @api {get} /ping Test the server connection
 */
PublicApiRouter.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});

/**
 * @api {post} /login Exchange username and password from request body for a session cookie
 */
PublicApiRouter.post('/login', (req, res) => {
    // TODO: implement login
    res.json({ message: 'login' });
});

/**
 * @api {post} /register Create a new user registration, sending a confirmation email
 */
PublicApiRouter.post('/register', (req, res) => {
    // TODO: implement registration
    res.json({ message: 'register' });
});

/**
 * @api {post} /confirm/:token Confirm a user registration with a token, creating the user account
 */
PublicApiRouter.post('/confirm/:token', (req, res) => {
    // TODO: implement email confirmation
    res.json({ message: 'confirm' });
});

ApiRouter.use('/', PublicApiRouter);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Configure session protected api routes                                                                           ///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const SessionProtectedApiRouter = express.Router();

SessionProtectedApiRouter.use((req, res, next) => {
    // TODO: implement session protection
});

/**
 * @api {get} /logout Clear the session cookie
 */
SessionProtectedApiRouter.get('/logout', (req, res) => {
    // TODO: implement logout
    res.json({ message: 'logout' });
});

// TODO: implement session protected routes here

ApiRouter.use('/', SessionProtectedApiRouter);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Register global error handler.                                                                                   ///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

ApiRouter.use(() => {
    // TODO: implement error handler
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
