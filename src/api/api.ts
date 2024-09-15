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
import { browseUsersProcedure } from '@api/procedures/browse.procedure';
import {
    getMessagesByUserIdProcedure,
    getUnreadMessagesByUserIdProcedure,
    getNumberOfUnreadMessagesByUserIdProcedure,
    getReadMessagesByUserIdProcedure,
} from '@api/procedures/message.procedure';

export const apiRouter = Router();

apiRouter.use(cookieParser()); // parse cookies
apiRouter.use(json()); // parse json body

const rpcRouter = createProcedureRouter([
    browseUsersProcedure,
    confirmEmailProcedure,
    confirmEmailModificationProcedure,
    emailAvailableProcedure,
    getExistingTagsProcedure,
    getMessagesByUserIdProcedure,
    getReadMessagesByUserIdProcedure,
    getNumberOfUnreadMessagesByUserIdProcedure,
    getUnreadMessagesByUserIdProcedure,
    getPrincipalProfileProcedure,
    getPrincipalUserLikesProcedure,
    getProfileByUsernameProcedure,
    getPrincipalUserStatsProcedure,
    getPrincipalUserVisitsProcedure,
    loginProcedure,
    logoutProcedure,
    patchPrincipalProfileProcedure,
    registerAccountProcedure,
    usernameAvailableProcedure,
    updateEmailProcedure,
    updatePasswordProcedure,
    verifySessionProcedure,
]);

export type RpcRouter = typeof rpcRouter;

apiRouter.use(rpcRouter);
