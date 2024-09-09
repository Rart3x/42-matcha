import { json, Router } from 'express';
import { createRpcRouter } from '@api/lib/procedure';
import {
    loginProcedure,
    logoutProcedure,
    verifySessionProcedure,
} from '@api/procedures/auth.procedures';
import {
    confirmEmailProcedure,
    createAccountProcedure,
    emailExistsProcedure,
    usernameExistsProcedure,
} from '@api/procedures/account.procedures';
import cookieParser from 'cookie-parser';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Configure root api router with global middlewares                                                                ///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const apiRouter = Router();

apiRouter.use(cookieParser()); // parse cookies
apiRouter.use(json()); // parse json body

export const rpcRouter = createRpcRouter([
    loginProcedure,
    logoutProcedure,
    verifySessionProcedure,
    createAccountProcedure,
    confirmEmailProcedure,
    usernameExistsProcedure,
    emailExistsProcedure,
]);

export type Procedures = (typeof rpcRouter)['__procedures'][number];

apiRouter.use(rpcRouter);
