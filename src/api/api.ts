import { json, Router } from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createRpcRouter } from '@api/lib/procedure';
import {
    loginProcedure,
    logoutProcedure,
    verifySessionProcedure,
} from '@api/procedures/auth.procedures';
import { confirmEmailProcedure, createAccountProcedure } from '@api/procedures/account.procedures';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Configure root api router with global middlewares                                                                ///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const apiRouter = Router();

const NODE_ENV = process.env?.['NODE_ENV'] || 'development';

if (NODE_ENV === 'development') {
    apiRouter.use(morgan('dev')); // colorful logger
}

if (NODE_ENV === 'production') {
    apiRouter.use(morgan('combined')); // logger
}

apiRouter.use(cookieParser()); // parse cookies
apiRouter.use(json()); // parse json body

export const rpcRouter = createRpcRouter([
    loginProcedure,
    logoutProcedure,
    verifySessionProcedure,
    createAccountProcedure,
    confirmEmailProcedure,
]);

export type Procedures = (typeof rpcRouter)['__procedures'][number];

apiRouter.use(rpcRouter);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Configure api routes                                                                                             ///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ApiRouter.use('/', AuthController);
//
// ApiRouter.use('/', AccountController);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Configure session protected api routes                                                                           ///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// const SessionProtectedApiRouter = Router();
//
// SessionProtectedApiRouter.use(SessionMiddleware);
//
// // TODO: implement session protected routes here
//
// ApiRouter.use('/', SessionProtectedApiRouter);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Register global error handler.                                                                                   ///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ApiRouter.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//     if (err instanceof UnauthorizedError) {
//         return res
//             .status(401)
//             .json({ error: { name: err.name, message: err.message } });
//     }
//     return res.sendStatus(400);
// });

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Configure api connections                                                                                        ///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// TODO: implement database connection
// TODO: implement session store connection ( necessary ? )
// TODO: implement email connection

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Export the configured api router                                                                                 ///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
