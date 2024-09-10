import { AsyncLocalStorage } from 'node:async_hooks';
import { CookieOptions, Router } from 'express';
import { Result } from '@api/lib/result';

type ProcedureStorage = {
    setCookie: (name: string, value: string, options: any) => void;
    getCookie: (name: string) => string | undefined;
    clearCookie: (name: string) => void;
};

const asyncLocalStorage = new AsyncLocalStorage<ProcedureStorage>();

export type ProcedureParams = Record<string, string> | void;
export type ProcedureResponse = Record<string, string | number> | never;
export type ProcedureError = string | never;

export type Procedure<
    NAME extends string,
    PARAMS extends ProcedureParams,
    RESPONSE extends ProcedureResponse,
    ERROR extends ProcedureError,
> = {
    name: NAME;
    router: Router;
    __params: PARAMS;
    __response: RESPONSE;
    __error: ERROR;
};

/**
 * Creates a new procedure with the given name and callback function. (without parameters)
 */
export function procedure<
    const NAME extends string,
    const PARAMS extends void,
    const RESPONSE extends ProcedureResponse,
    const ERROR extends ProcedureError,
>(
    name: NAME,
    fn: () => Result<RESPONSE, ERROR> | Promise<Result<RESPONSE, ERROR>>,
): Procedure<NAME, PARAMS, RESPONSE, ERROR>;

/**
 * Creates a new procedure with the given name, parameters, and callback function.
 */
export function procedure<
    const NAME extends string,
    const PARAMS extends ProcedureParams,
    const RESPONSE extends ProcedureResponse,
    const ERROR extends ProcedureError,
>(
    name: NAME,
    params: PARAMS,
    fn: (params: Partial<PARAMS>) => Result<RESPONSE, ERROR> | Promise<Result<RESPONSE, ERROR>>,
): Procedure<NAME, PARAMS, RESPONSE, ERROR>;

export function procedure<
    const NAME extends string,
    const PARAMS extends ProcedureParams,
    const RESPONSE extends ProcedureResponse,
    const ERROR extends ProcedureError,
>(
    name: NAME,
    paramsOrFn:
        | PARAMS
        | ((params: Partial<PARAMS>) => Result<RESPONSE, ERROR> | Promise<Result<RESPONSE, ERROR>>),
    fn?: (params: Partial<PARAMS>) => Result<RESPONSE, ERROR> | Promise<Result<RESPONSE, ERROR>>,
): Procedure<NAME, PARAMS, RESPONSE, ERROR> {
    const hasParams = typeof paramsOrFn === 'object';

    // use callback from second or third argument based on whether params are provided
    const callback = (hasParams ? fn : (paramsOrFn as typeof fn))!;

    const router = Router();

    router.post(`/${name}`, async (req, res, next) => {
        const result = await asyncLocalStorage.run(
            {
                setCookie: (name: string, value: string, options: CookieOptions) =>
                    res.cookie(name, value, options),
                getCookie: (name: string) => req.cookies?.[name],
                clearCookie: (name: string) => res.clearCookie(name, { path: '/' }),
            },
            async () => callback(req.body),
        );

        if (result.isErr()) {
            return res.status(400).json({ error: result.error() });
        }

        const value = result.value();

        if (typeof value === 'undefined') {
            return res.sendStatus(204);
        }

        return res.json(value);
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
export function useSetCookie() {
    const storage = asyncLocalStorage.getStore();
    if (!storage) {
        throw new Error('Cannot call useSetCookie outside of a procedure');
    }
    return storage.setCookie;
}

/**
 * Get a cookie from the request
 */
export function useGetCookie() {
    const storage = asyncLocalStorage.getStore();
    if (!storage) {
        throw new Error('Cannot call useGetCookie outside of a procedure');
    }
    return storage.getCookie;
}

/**
 * Clear a cookie from the response
 */
export function useClearCookie() {
    const storage = asyncLocalStorage.getStore();
    if (!storage) {
        throw new Error('Cannot call useClearCookie outside of a procedure');
    }
    return storage.clearCookie;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Router definition

export type RpcRouter<PROCEDURES extends Array<Procedure<any, any, any, any>>> = Router & {
    __procedures: PROCEDURES;
};

type ArrayToUnion<T extends any[]> = T[number] extends infer U ? U : never;

export function createRpcRouter<PROCEDURES extends Array<Procedure<any, any, any, any>>>(
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
