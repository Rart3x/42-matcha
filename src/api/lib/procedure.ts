import { CookieOptions, Router } from 'express';
import { Result } from '@api/lib/result';

import { AsyncLocalStorage } from 'node:async_hooks';

type ProcedureStorage = {
    setCookie: (name: string, value: string, options: any) => void;
    getCookie: (name: string) => string | undefined;
    clearCookie: (name: string) => void;
};

const asyncLocalStorage = new AsyncLocalStorage<ProcedureStorage>();

export type ProcedureParams = Record<string, string>;
export type ProcedureResponse = Record<string, string>;

export type Procedure<
    NAME extends string,
    PARAMS extends ProcedureParams = {},
    RESPONSE extends ProcedureResponse = {},
    ERROR extends string = never,
> = {
    name: NAME;
    router: Router;
    __params: PARAMS;
    __response: RESPONSE;
    __error: ERROR;
};

export function procedure<
    NAME extends string,
    PARAMS extends ProcedureParams = {},
    RESPONSE extends ProcedureResponse = {},
    ERROR extends string = never,
>(
    name: NAME,
    fn: (
        params: PARAMS,
    ) => Result<RESPONSE, ERROR> | Promise<Result<RESPONSE, ERROR>>,
): Procedure<NAME, PARAMS, RESPONSE, ERROR> {
    const router = Router();

    router.post(`/${name}`, async (req, res, next) => {
        const result = await asyncLocalStorage.run(
            {
                setCookie: res.cookie.bind(res),
                getCookie: (name: string) => req.cookies?.[name],
                clearCookie: res.clearCookie.bind(res),
            },
            () => fn(req.body),
        );

        if (result.isErr()) {
            return res.status(400).json({ error: result.err() });
        }

        return res.json(result.ok());
    });

    return {
        name,
        router,
    } as Procedure<NAME, PARAMS, RESPONSE, ERROR>;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// core procedure hooks

/**
 * Set a cookie in the response
 */
export function useSetCookie(
    name: string,
    value: string,
    options: CookieOptions,
) {
    const storage = asyncLocalStorage.getStore();
    if (storage) {
        return storage.setCookie(name, value, options);
    }
    throw new Error('Cannot set cookie outside of a procedure');
}

/**
 * Get a cookie from the request
 */
export function useGetCookie(name: string) {
    const storage = asyncLocalStorage.getStore();
    if (storage) {
        return storage.getCookie(name);
    }
    throw new Error('Cannot get cookie outside of a procedure');
}

/**
 * Clear a cookie from the response
 */
export function useClearCookie(name: string) {
    const storage = asyncLocalStorage.getStore();
    if (storage) {
        return storage.clearCookie(name);
    }
    throw new Error('Cannot clear cookie outside of a procedure');
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Router definition

export type RpcRouter<PROCEDURES extends Array<Procedure<any, any, any, any>>> =
    Router & {
        __procedures: PROCEDURES;
    };

type ArrayToUnion<T extends any[]> = T[number] extends infer U ? U : never;

export function createRpcRouter<
    PROCEDURES extends Array<Procedure<any, any, any, any>>,
>(
    // the array
    procedures: PROCEDURES,
): RpcRouter<PROCEDURES> {
    const router = Router();

    // iterate over the procedures
    for (const procedure of procedures) {
        console.log('✅ Adding procedure:', procedure.name);
        router.use(procedure.router);
    }

    if (procedures.length === 0) {
        console.warn('⚠️ No procedures added to the router');
    }

    return router as any as RpcRouter<PROCEDURES>;
}
