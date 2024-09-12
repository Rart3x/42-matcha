import { CookieOptions, Router } from 'express';
import { AsyncLocalStorage } from 'node:async_hooks';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Procedure storage

/**
 * Procedure storage type.
 * @note Used to provide access to cookies functions within a procedure.
 * @note Uses async local storage under the hood.
 */
type ProcedureStorage = {
    setCookie: (name: string, value: string, options: any) => void;
    getCookie: (name: string) => string | undefined;
    clearCookie: (name: string) => void;
};

const storage = new AsyncLocalStorage<ProcedureStorage>();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Error classes

export abstract class ProcedureError<key extends string> {
    protected constructor(
        private readonly key: key,
        private readonly statusCode: number,
    ) {}

    get asResponse() {
        return { error: this.key };
    }
}

class BadRequest<key extends string> extends ProcedureError<key> {
    constructor(key: key) {
        super(key, 400);
    }
}

class Unauthorized extends ProcedureError<'UNAUTHORIZED'> {
    constructor() {
        super('UNAUTHORIZED', 401);
    }
}

/**
 * Creates a new BadRequest error with the given key.
 * @note will be caught by the procedure and returned as a 400 response.
 */
export function badRequest<key extends string>(key: key): BadRequest<key> {
    return new BadRequest(key);
}

/**
 * Throws a BadRequest error with the key 'UNAUTHORIZED'.
 * @note will be caught by the procedure and returned as a 401 response.
 * @note should be used when the user is not authenticated. (invalid session token)
 */
export function unauthorized(): Unauthorized {
    return new Unauthorized();
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Response helpers

export type ProcedureResponse<T extends Record<string, string> | void> = T;

/**
 * Marks the given data as a response.
 * @note will be returned as a 200 response.
 * @note Is noop, only for code clarity.
 */
export function response<T extends Record<string, string> | void>(data: T): ProcedureResponse<T> {
    return data;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Procedure contract

/**
 * Procedure contract type.
 * @note Used to define the contract of a procedure.
 * @note Should be inferred by the procedure function.
 */
export type ProcedureContract<
    NAME extends string,
    PARAMS extends Record<string, string> | void,
    RETURNS extends ProcedureResponse<any> | void,
    ERRORS extends ProcedureError<string> | void,
> = {
    __name: NAME;
    __params: PARAMS;
    __returns: RETURNS;
    __errors: ERRORS | BadRequest<'UNKNOWN_ERROR'>;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Procedure helpers

export type ExtractName<CONTRACT extends ProcedureContract<any, any, any, any>> =
    CONTRACT['__name'];
export type ExtractParams<CONTRACT extends ProcedureContract<any, any, any, any>> =
    CONTRACT['__params'];
export type ExtractReturns<CONTRACT extends ProcedureContract<any, any, any, any>> =
    CONTRACT['__returns'];
export type ExtractErrors<CONTRACT extends ProcedureContract<any, any, any, any>> =
    CONTRACT['__errors'];

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Procedure callback

export type ProcedureCallback<
    PARAMS extends Record<string, string> | void,
    RETURNS extends ProcedureResponse<any> | ProcedureError<any> | void,
> = (params: Partial<PARAMS>) => Promise<RETURNS>;

type ExcludeFromUnionIfNotOnlyType<Union, Type> =
    Exclude<Union, Type> extends never ? Union : Exclude<Union, Type>;

type OnlyError<T> = ExcludeFromUnionIfNotOnlyType<T extends ProcedureError<any> ? T : void, void>;
type OnlyResponse<T> = ExcludeFromUnionIfNotOnlyType<
    T extends ProcedureError<any> ? void : T extends undefined ? void : T,
    void
>;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Procedure type

export type Procedure<contract extends ProcedureContract<any, any, any, any>> = Router & {
    __name: ExtractName<contract>;
    __contract: contract;
};

export type ExtractContract<PROCEDURE extends Procedure<any>> = PROCEDURE['__contract'];

/**
 * Creates a new procedure with the given name and callback (no params).
 * @note infers the contract from its arguments.
 */
export function procedure<
    NAME extends string,
    PARAMS extends void,
    RETURNS extends ProcedureResponse<any> | ProcedureError<any> | void,
>(
    name: NAME,
    callback: ProcedureCallback<PARAMS, RETURNS>,
): Procedure<
    ProcedureContract<
        NAME,
        PARAMS,
        OnlyResponse<RETURNS>,
        OnlyError<RETURNS> | BadRequest<'UNKNOWN_ERROR'>
    >
>;

/**
 * Creates a new procedure with the given name and callback (with params).
 * @note infers the contract from its arguments.
 */
export function procedure<
    NAME extends string,
    PARAMS extends Record<string, string>,
    RETURNS extends ProcedureResponse<any> | ProcedureError<any> | void,
>(
    name: NAME,
    _params: PARAMS,
    callback: ProcedureCallback<PARAMS, RETURNS>,
): Procedure<
    ProcedureContract<
        NAME,
        PARAMS,
        OnlyResponse<RETURNS>,
        OnlyError<RETURNS> | BadRequest<'UNKNOWN_ERROR'>
    >
>;

// Implementation
export function procedure<
    NAME extends string,
    PARAMS extends Record<string, string> | void,
    RETURNS extends ProcedureResponse<any> | ProcedureError<any> | void,
>(
    name: NAME,
    paramsOrCallback: PARAMS | ProcedureCallback<PARAMS, RETURNS>,
    callback?: ProcedureCallback<PARAMS, RETURNS>,
): Procedure<
    ProcedureContract<
        NAME,
        PARAMS,
        OnlyResponse<RETURNS>,
        OnlyError<RETURNS> | BadRequest<'UNKNOWN_ERROR'>
    >
> {
    const router = Router() as Procedure<any>;

    const callbackFn = (callback ?? (paramsOrCallback as typeof callback))!;

    router.__name = name;

    router.post(`/${name}`, (req, res, _) => {
        // run callback under async local storage to provide access to cookies functions
        storage
            .run(
                {
                    setCookie: (name: string, value: string, options: CookieOptions) =>
                        res.cookie(name, value, options),
                    getCookie: (name: string) => req.cookies?.[name],
                    clearCookie: (name: string) => res.clearCookie(name, { path: '/' }),
                },
                () => callbackFn(req.body),
            )
            .then((result) => {
                if (typeof result === 'object') {
                    return res.status(200).json(result);
                }
                return res.status(200).send();
            })
            .catch((error) => {
                if (error instanceof BadRequest) {
                    return res.status(400).json(error.asResponse);
                }
                if (error instanceof Unauthorized) {
                    return res.status(401).json(error.asResponse);
                }
                return res.status(400).json({ error: 'UNKNOWN_ERROR' });
            });
    });

    return router;
}

export function useProcedureStorage(): ProcedureStorage {
    const storageValue = storage.getStore();
    if (!storageValue) {
        console.error('!!!');
        console.error('!!! useProcedureStorage() must be called within a procedure');
        console.error('!!!');
        throw new Error('Hook must be called within a procedure');
    }
    return storageValue;
}

export async function getCookie(name: string): Promise<string | undefined> {
    return useProcedureStorage().getCookie(name);
}

export async function setCookie(
    name: string,
    value: string,
    options: CookieOptions,
): Promise<void> {
    useProcedureStorage().setCookie(name, value, options);
}

export async function clearCookie(name: string): Promise<void> {
    useProcedureStorage().clearCookie(name);
}

const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

/**
 * @throws {Unauthorized}
 */
export async function getSessionToken() {
    const token = await getCookie('session');
    if (!token) {
        return unauthorized();
    }
    if (!UUID_REGEX.test(token)) {
        return unauthorized();
    }
    return token;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Procedure router

export type ProcedureRouter<procedures extends Procedure<any>> = Router & {
    __procedures: procedures;
};

export function createProcedureRouter<procedures extends Procedure<any>[]>(
    ...procedures: procedures
): ProcedureRouter<procedures[number]> {
    const router = Router();

    console.log('Creating procedure router...');

    procedures.forEach((procedure) => {
        console.log(`  ✅ Adding procedure: ${procedure.__name}`);
        router.use(procedure);
    });

    return router as ProcedureRouter<procedures[number]>;
}

export type ExtractProcedures<ROUTER extends ProcedureRouter<any>> = ROUTER['__procedures'];

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Usage

// const login = procedure(
//     'login',
//     {} as {
//         username: string;
//         password: string;
//     },
//     async ({ username, password }) => {
//         if (username === 'admin' && password === 'admin') {
//             return;
//         }
//         return badRequest('INVALID_CREDENTIALS');
//     },
// );
//
// const _router = createProcedureRouter(login);
