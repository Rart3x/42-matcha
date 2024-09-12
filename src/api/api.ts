import { json, Router } from 'express';
import cookieParser from 'cookie-parser';
import { createProcedureRouter } from './lib/procedure-router';
import {
    loginProcedure,
    logoutProcedure,
    verifySessionProcedure,
} from '@api/procedures/auth.procedure';
import {
    confirmEmailProcedure,
    emailAvailableProcedure,
    registerAccountProcedure,
    usernameAvailableProcedure,
} from '@api/procedures/account.procedure';

export const apiRouter = Router();

apiRouter.use(cookieParser()); // parse cookies
apiRouter.use(json()); // parse json body

const rpcRouter = createProcedureRouter([
    verifySessionProcedure,
    loginProcedure,
    logoutProcedure,
    registerAccountProcedure,
    confirmEmailProcedure,
    usernameAvailableProcedure,
    emailAvailableProcedure,
]);

export type RpcRouter = typeof rpcRouter;

apiRouter.use(rpcRouter);
