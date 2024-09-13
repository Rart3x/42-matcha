import { Request, Response, Router } from 'express';
import { AsyncLocalStorage } from 'node:async_hooks';
import { BaseApiError } from './base-api-error';

export type ProcedureParams = Record<string, any> | void;
export type ProcedureResult = Record<string, any>;

export type AsyncRouterContext = {
    request: Request;
    response: Response;
};

export type ProcedureContract<
    NAME extends string,
    PARAMS extends ProcedureParams,
    RESULT extends ProcedureResult,
> = {
    __name: NAME;
    __params: PARAMS;
    __result: RESULT;
};

export type Procedure<
    NAME extends string,
    PARAMS extends ProcedureParams,
    RESULT extends ProcedureResult,
> = Router & {
    procedureName: NAME;
    __contract: ProcedureContract<NAME, PARAMS, RESULT>;
};

export const asyncLocalRouterStorage = new AsyncLocalStorage<AsyncRouterContext>();

export function procedure<NAME extends string, PARAMS extends void, RESULT extends ProcedureResult>(
    name: NAME,
    handler: () => Promise<RESULT>,
): Procedure<NAME, PARAMS, RESULT>;

export function procedure<
    NAME extends string,
    PARAMS extends Exclude<ProcedureParams, void>,
    RESULT extends ProcedureResult,
>(
    name: NAME,
    paramsOrHandler: PARAMS,
    handler: (params: Partial<PARAMS>) => Promise<RESULT>,
): Procedure<NAME, PARAMS, RESULT>;

export function procedure<
    NAME extends string,
    PARAMS extends ProcedureParams,
    RESULT extends ProcedureResult,
>(
    name: NAME,
    paramsOrHandler: PARAMS | ((params: PARAMS) => Promise<RESULT>),
    handler?: (params: Partial<PARAMS>) => Promise<RESULT>,
): Procedure<NAME, PARAMS, RESULT> {
    const router = Router() as Procedure<NAME, PARAMS, RESULT>;

    const _handler = handler || (paramsOrHandler as typeof handler)!;

    router.procedureName = name;

    router.post(`/${name}`, async (req, res, _) => {
        await asyncLocalRouterStorage.run({ request: req, response: res }, async () => {
            try {
                const result = await _handler(req.body);

                return res.status(200).json(result);
            } catch (error) {
                if (error instanceof BaseApiError) {
                    return res.status(error.code).json(error.asDto);
                }
                return res.status(400).json({ error: 'Bad Request' });
            }
        });
    });

    return router;
}
