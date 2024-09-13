import { json, Router } from 'express';
import cookieParser from 'cookie-parser';
import { createProcedureRouter } from './lib/procedure-router';
import {
    loginProcedure,
    logoutProcedure,
    verifySessionProcedure,
} from '@api/procedures/auth.procedure';
import {
    confirmEmailModificationProcedure,
    confirmEmailProcedure,
    emailAvailableProcedure,
    registerAccountProcedure,
    updateEmailProcedure,
    updatePasswordProcedure,
    usernameAvailableProcedure,
} from '@api/procedures/account.procedure';
import {
    getExistingTagsProcedure,
    getPrincipalProfileProcedure,
    getProfileByUsernameProcedure,
    patchPrincipalProfileProcedure,
} from '@api/procedures/profile.procedure';
import {
    getPrincipalUserLikesProcedure,
    getPrincipalUserStatsProcedure,
    getPrincipalUserVisitsProcedure,
} from '@api/procedures/relation.procedure';

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
    getPrincipalProfileProcedure,
    patchPrincipalProfileProcedure,
    updateEmailProcedure,
    updatePasswordProcedure,
    getExistingTagsProcedure,
    confirmEmailModificationProcedure,
    getProfileByUsernameProcedure,
    getPrincipalUserStatsProcedure,
    getPrincipalUserLikesProcedure,
    getPrincipalUserVisitsProcedure,
]);

export type RpcRouter = typeof rpcRouter;

apiRouter.use(rpcRouter);
