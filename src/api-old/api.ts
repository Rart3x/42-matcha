import { json, Router } from 'express';
import { createRpcRouter } from './lib/procedure';
import {
    confirmEmailProcedure,
    createAccountProcedure,
    emailExistsProcedure,
    usernameExistsProcedure,
} from './procedures/account.procedures';
import cookieParser from 'cookie-parser';
import { getProfile } from './procedures/profile.procedures';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Configure root api router with global middlewares                                                                ///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const apiRouterOld = Router();

apiRouterOld.use(cookieParser()); // parse cookies
apiRouterOld.use(json()); // parse json body

export const rpcRouter = createRpcRouter([
    createAccountProcedure,
    confirmEmailProcedure,
    usernameExistsProcedure,
    emailExistsProcedure,
    getProfile,
]);

// const procedureRouter = createProcedureRouter(getProfileProcedure, getProfileByUsernameProcedure);
//
// export type ProcedureContracts = ExtractContract<ExtractProcedures<typeof procedureRouter>>;

export type Procedures = (typeof rpcRouter)['__procedures'][number];

apiRouterOld.use(rpcRouter);
// apiRouter.use(procedureRouter);
