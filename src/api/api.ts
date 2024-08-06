import { json, NextFunction, Request, Response, Router } from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { SessionMiddleware } from '@api/middlewares/session.middleware';
import { UnauthorizedError } from '@api/exceptions/UnauthorizedError';
import { AuthController } from '@api/controllers/auth.controller';
import { AccountController } from '@api/controllers/account.controller';
import { ValidationError } from '@api/exceptions/ValidationError';

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

ApiRouter.use('/', AccountController);

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
        return res
            .status(401)
            .json({ error: { name: err.name, message: err.message } });
    }
    if (err instanceof ValidationError) {
        return res
            .status(400)
            .json({ error: { name: err.name, message: err.message } });
    }
    return res.sendStatus(400);
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
