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
import {
    getNotificationsProcedure,
    getNumberOfUnreadNotificationsProcedure,
    getUnreadNotificationsProcedure,
} from '@api/procedures/notifcation.procedure';
import { createBlockProcedure, deleteBlockProcedure } from '@api/procedures/block.procedure';
import {
    createLikeProcedure,
    deleteLikeProcedure,
    getLikesProcedure,
} from '@api/procedures/like.procedure';
import {
    createVisitProcedure,
    deleteVisitProcedure,
    getVisitsProcedure,
} from '@api/procedures/visit.procedure';

export const apiRouter = Router();

apiRouter.use(cookieParser()); // parse cookies
apiRouter.use(json()); // parse json body

const rpcRouter = createProcedureRouter([
    browseUsersProcedure,
    confirmEmailProcedure,
    confirmEmailModificationProcedure,
    createBlockProcedure,
    createLikeProcedure,
    createVisitProcedure,
    deleteBlockProcedure,
    deleteLikeProcedure,
    deleteVisitProcedure,
    emailAvailableProcedure,
    getExistingTagsProcedure,
    getLikesProcedure,
    getVisitsProcedure,
    getMessagesByUserIdProcedure,
    getReadMessagesByUserIdProcedure,
    getNotificationsProcedure,
    getUnreadNotificationsProcedure,
    getNumberOfUnreadNotificationsProcedure,
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
