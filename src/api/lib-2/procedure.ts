export type ProcedureContract<
    NAME extends string,
    PARAMS extends Record<string, string> | void,
    RETURNS extends Record<string, string> | void,
    ERRORS extends string,
> = {
    __name: NAME;
    __params: PARAMS;
    __returns: RETURNS;
    __errors: ERRORS;
};

export type ExtractName<CONTRACT extends ProcedureContract<any, any, any, any>> =
    CONTRACT['__name'];
export type ExtractParams<CONTRACT extends ProcedureContract<any, any, any, any>> =
    CONTRACT['__params'];
export type ExtractReturns<CONTRACT extends ProcedureContract<any, any, any, any>> =
    CONTRACT['__returns'];
export type ExtractErrors<CONTRACT extends ProcedureContract<any, any, any, any>> =
    CONTRACT['__errors'];

export type Procedure<contract extends ProcedureContract<any, any, any, any>> = {
    __contract: contract;
};

export type ExtractContract<PROCEDURE extends Procedure<any>> = PROCEDURE['__contract'];

export function procedure<contract extends ProcedureContract<any, any, any, any>>(
    name: ExtractName<contract>,
    callback: (params: Partial<ExtractParams<contract>>) => Promise<ExtractReturns<contract>>,
): Procedure<contract> {
    return {} as any;
}

export type LoginContract = ProcedureContract<
    'login',
    { username: string; password: string },
    void,
    'invalid_credentials'
>;

export const loginProcedure = procedure<LoginContract>('login', async ({ username, password }) => {
    throw new Error('not implemented');
});
