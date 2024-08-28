import { CookieOptions, Router } from 'express';
import { db } from '@api/connections/_database';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Procedure types

export type ProcedureParams = Record<string, string>;

export type UnauthorizedProcedureResponse =
    | {
          code: 200;
          data: Record<string, string>;
      }
    | {
          code: 400;
          error: string;
      };

export type AuthorizedProcedureResponse =
    | UnauthorizedProcedureResponse
    | {
          code: 401;
          error: string;
      };

export type ProcedureResponse =
    | UnauthorizedProcedureResponse
    | AuthorizedProcedureResponse;

export type ErrorResponse = {
    code: 400 | 401;
    error: string;
};

export type UnauthorizedProcedureContext = {
    getCookie: (name: string) => string | undefined;
    setCookie: (name: string, value: string, options: CookieOptions) => void;
    clearCookie: (name: string, options: CookieOptions) => void;
};

export type AuthorizedProcedureContext = UnauthorizedProcedureContext & {
    userId: string;
    sessionId: string;
};

export type UnauthorizedProcedureCallback<
    PARAMS extends ProcedureParams,
    RESPONSE extends UnauthorizedProcedureResponse,
> = (params: PARAMS, ctx: UnauthorizedProcedureContext) => Promise<RESPONSE>;

export type AuthorizedProcedureCallback<
    PARAMS extends ProcedureParams,
    RESPONSE extends AuthorizedProcedureResponse,
> = (params: PARAMS, ctx: AuthorizedProcedureContext) => Promise<RESPONSE>;

export type UnauthorizedProcedure<
    NAME extends string,
    PARAMS extends ProcedureParams,
    RESPONSE extends UnauthorizedProcedureResponse,
> = {
    router: Router;
    name: NAME;
    params: PARAMS;
    response: RESPONSE;
    authorized: false;
};

export type AuthorizedProcedure<
    NAME extends string,
    PARAMS extends ProcedureParams,
    RESPONSE extends AuthorizedProcedureResponse,
> = {
    router: Router;
    name: NAME;
    params: PARAMS;
    response: RESPONSE;
    authorized: true;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Procedure definition

export function unauthorizedProcedure<
    NAME extends string,
    PARAMS extends ProcedureParams,
    RESPONSE extends UnauthorizedProcedureResponse,
>(
    name: NAME,
    callback: UnauthorizedProcedureCallback<PARAMS, RESPONSE>,
): UnauthorizedProcedure<NAME, PARAMS, RESPONSE> {
    const router = Router();

    router.post(`/${name}`, (req, res, _next) => {
        const params = req.body as PARAMS;

        const getCookie = (name: string) => req.cookies?.[name];
        const setCookie = res.cookie.bind(res);
        const clearCookie = res.clearCookie.bind(res);

        const ctx: UnauthorizedProcedureContext = {
            getCookie,
            setCookie,
            clearCookie,
        };

        callback(params, ctx)
            .then((response) => {
                res.status(response.code).json(response);
            })
            .catch(() => {
                console.error('Error in procedure', name);
                res.sendStatus(500);
            });
    });

    return { router, name, authorized: false } as any as UnauthorizedProcedure<
        NAME,
        PARAMS,
        RESPONSE
    >;
}

export function authorizedProcedure<
    NAME extends string,
    PARAMS extends ProcedureParams,
    RESPONSE extends AuthorizedProcedureResponse,
>(
    name: NAME,
    callback: AuthorizedProcedureCallback<PARAMS, RESPONSE>,
): AuthorizedProcedure<NAME, PARAMS, RESPONSE> {
    const router = Router();

    router.post(`/${name}`, async (req, res, _next) => {
        const params = req.body as PARAMS;

        const getCookie = (name: string) => req.cookies?.[name];
        const setCookie = res.cookie.bind(res);
        const clearCookie = res.clearCookie.bind(res);

        const token = req.cookies?.session;

        if (!token) {
            res.status(401).json({ code: 401, error: 'Not logged in' });
            return;
        }

        // TODO: Implement session verification without sql function
        const users = await db.sql<{ user_id?: number }>(
            // language=SQL
            'SELECT verify_and_refresh_session($1) AS user_id',
            [token],
        );

        const userId = users[0].user_id;

        if (!userId) {
            res.clearCookie('session')
                .status(401)
                .json({ code: 401, error: 'Not logged in' });
            return;
        }

        const ctx: AuthorizedProcedureContext = {
            getCookie,
            setCookie,
            clearCookie,
            userId: '123',
            sessionId: '456',
        };

        const response = await callback(params, ctx);

        res.status(response.code).json(response);
    });

    return { router, name, authorized: true } as any as AuthorizedProcedure<
        NAME,
        PARAMS,
        RESPONSE
    >;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Router definition

export type RpcRouter<PROCEDURES extends any> = {
    router: Router;
    procedures: PROCEDURES;
};

type ArrayToUnion<T extends any[]> = T[number] extends infer U ? U : never;

export function rpcRouter<PROCEDURES extends any[]>(
    // the array
    procedures: PROCEDURES,
): RpcRouter<ArrayToUnion<PROCEDURES>> {
    const router = Router();

    // iterate over the procedures
    for (const procedure of procedures) {
        if (procedure.authorized) {
            console.log('✅ Adding authorized procedure', procedure.name);
        } else {
            console.log('✅ Adding unauthorized procedure', procedure.name);
        }
        router.use(procedure.router);
    }

    return { router, procedures } as any as RpcRouter<ArrayToUnion<PROCEDURES>>;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Response helpers

export function successResponse<DATA extends Record<string, string>>(
    data: DATA,
): { code: 200; data: DATA } {
    return { code: 200 as const, data };
}

export function badRequestResponse<T extends string>(error: T) {
    return { code: 400 as const, error };
}

export function unauthorizedResponse<T extends string>(error: T) {
    return { code: 401 as const, error };
}

export function isErrorResponse<T>(value: any): value is ErrorResponse {
    try {
        return 'error' in value;
    } catch (_) {
        return false;
    }
}
