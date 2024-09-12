////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Procedure storage

import { AsyncLocalStorage } from 'node:async_hooks';
import { err, Result } from '../lib-3/result';
import { Router } from 'express';

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

/**
 * Base class for procedure errors.
 * @note Wraps an error key for message mapping (and possibly translation) on the client side.
 * @note Provides a status code for its associated HTTP response, enabling the client to handle errors accordingly.
 */
export abstract class ProcedureError<key extends string> {
    protected constructor(
        private readonly key: key,
        private readonly statusCode: number,
    ) {}

    get asResponse() {
        return { error: this.key };
    }
}

/**
 * Represents a bad request error.
 */
class BadRequestError<key extends string> extends ProcedureError<key> {
    constructor(key: key) {
        super(key, 400);
    }
}

/**
 * Represents an unauthorized error.
 * @note should be used when the user is not authenticated. (invalid session token)
 * @note will be caught by the frontend to redirect the user to the login page.
 */
class UnauthorizedError extends ProcedureError<'UNAUTHORIZED'> {
    constructor() {
        super('UNAUTHORIZED', 401);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Error utilities

/**
 * Creates a new BadRequest error with the given key.
 * @note will be caught by the procedure and returned as a 400 response.
 */
export function badRequestErr<key extends string>(key: key) {
    return err(new BadRequestError(key));
}

/**
 * Throws a BadRequest error with the key 'UNAUTHORIZED'.
 * @note will be caught by the procedure and returned as a 401 response.
 * @note should be used when the user is not authenticated. (invalid session token)
 */
export function unauthorizedErr() {
    return err(new UnauthorizedError());
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Response class

/**
 * Represents a successful response.
 * @note Wraps the data to be returned to the client.
 */
export class ProcedureResponse<DATA extends Record<string, string | number>> {
    constructor(private readonly data: DATA) {}

    get asResponse() {
        return { data: this.data };
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Response utilities

/**
 * Creates a new response with the given data.
 * @note will be caught by the procedure and returned as a 200 response.
 * @note should be used when the procedure is successful.
 */
export function response<DATA extends Record<string, string | number>>(data: DATA) {
    return new ProcedureResponse(data);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Procedure class

/**
 * Procedure contract type.
 * @note Used to define the contract of a procedure.
 * @note Should be inferred by the procedure function.
 */
export type ProcedureContract<
    NAME extends string,
    PARAMS extends Record<string, string> | void,
    RESPONSE extends ProcedureResponse<any> | void,
    ERROR extends ProcedureError<string> | void,
> = {
    __name: NAME;
    __params: PARAMS;
    __response: RESPONSE;
    __error: ERROR;
};

export type ExtractName<CONTRACT extends ProcedureContract<any, any, any, any>> =
    CONTRACT['__name'];
export type ExtractParams<CONTRACT extends ProcedureContract<any, any, any, any>> =
    CONTRACT['__params'];
export type ExtractResponse<CONTRACT extends ProcedureContract<any, any, any, any>> =
    CONTRACT['__response'];
export type ExtractError<CONTRACT extends ProcedureContract<any, any, any, any>> =
    CONTRACT['__error'];

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Procedure function type

export type ProcedureFn<
    PARAMS extends Record<string, string> | void,
    RESPONSE extends ProcedureResponse<any> | void,
    ERROR extends ProcedureError<string> | void,
> = (params: Partial<PARAMS>) => Result<RESPONSE, ERROR> | Promise<Result<RESPONSE, ERROR>>;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Procedure type

export type Procedure<CONTRACT extends ProcedureContract<any, any, any, any>> = Router & {
    __name: ExtractName<CONTRACT>;
    __contract: CONTRACT;
};

export type ExtractProcedureContract<PROCEDURE extends Procedure<any>> = PROCEDURE['__contract'];

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Procedure function

/**
 * Creates a new procedure with the given name and callback function. (without parameters)
 * @note should be used when the procedure does not require any parameters.
 */
//TODO: write the function signature
