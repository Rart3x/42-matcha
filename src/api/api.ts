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
    getEmailProcedure,
    getOnlineStatusByIdProcedure,
    registerAccountProcedure,
    updateEmailProcedure,
    updatePasswordProcedure,
    usernameAvailableProcedure,
} from '@api/procedures/account.procedure';
import { getProfileByIdProcedure } from '@api/procedures/profile.procedure';
import { getPrincipalUserStatsProcedure } from '@api/procedures/stats.procedures';
import { browseUsersProcedure } from '@api/procedures/browse.procedure';
import {
    canChatWithUserProcedure,
    getConversationsProcedure,
    getMessagesByUserIdProcedure,
    getUnreadMessageCountProcedure,
    postMessageProcedure,
} from '@api/procedures/message.procedure';
import {
    getNotificationsProcedure,
    getUnreadNotificationsCountProcedure,
    getUnreadNotificationsProcedure,
} from '@api/procedures/notification.procedure';
import { createBlockProcedure, deleteBlockProcedure } from '@api/procedures/block.procedure';
import {
    createLikeProcedure,
    deleteLikeProcedure,
    getPrincipalUserLikesProcedure,
} from '@api/procedures/like.procedure';
import { getPrincipalUserVisitsProcedure } from '@api/procedures/visit.procedure';
import {
    createFakeUserReportProcedure,
    deleteFakeUserReportProcedure,
} from '@api/procedures/fake_user_report.procedure';
import { searchUsersProcedure } from '@api/procedures/search.procedure';
import { picturesRouter } from '@api/pictures/pictures.router';
import {
    getPrincipalUserLocationProcedure,
    upsertLocationProcedure,
} from '@api/procedures/locations.procedure';
import { getExistingTagsProcedure } from '@api/procedures/tags.procedures';
import {
    getPrincipalProfileProcedure,
    patchPrincipalProfileProcedure,
} from '@api/procedures/principal-profile.procedures';
import {
    createPasswordModificationProcedure,
    deletePasswordModificationProcedure,
} from '@api/procedures/password_modification.procedure';

export const apiRouter = Router();

apiRouter.use(cookieParser()); // parse cookies
apiRouter.use(json()); // parse json body

const rpcRouter = createProcedureRouter([
    browseUsersProcedure,
    confirmEmailProcedure,
    confirmEmailModificationProcedure,
    createBlockProcedure,
    createFakeUserReportProcedure,
    createLikeProcedure,
    deleteBlockProcedure,
    deleteFakeUserReportProcedure,
    deleteLikeProcedure,
    emailAvailableProcedure,
    getExistingTagsProcedure,
    getMessagesByUserIdProcedure,
    getNotificationsProcedure,
    getUnreadNotificationsProcedure,
    getUnreadNotificationsCountProcedure,
    getUnreadMessageCountProcedure,
    getPrincipalProfileProcedure,
    getPrincipalUserLikesProcedure,
    getProfileByIdProcedure,
    getPrincipalUserStatsProcedure,
    getPrincipalUserVisitsProcedure,
    loginProcedure,
    logoutProcedure,
    patchPrincipalProfileProcedure,
    registerAccountProcedure,
    searchUsersProcedure,
    usernameAvailableProcedure,
    updateEmailProcedure,
    updatePasswordProcedure,
    verifySessionProcedure,
    getEmailProcedure,
    upsertLocationProcedure,
    getOnlineStatusByIdProcedure,
    getPrincipalUserLocationProcedure,
    getConversationsProcedure,
    postMessageProcedure,
    canChatWithUserProcedure,
    deletePasswordModificationProcedure,
    createPasswordModificationProcedure,
]);

export type RpcRouter = typeof rpcRouter;

apiRouter.use('/pictures', picturesRouter);
apiRouter.use(rpcRouter);
