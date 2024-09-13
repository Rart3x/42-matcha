import { Procedure, ProcedureContract } from './procedure';
import { Router } from 'express';

export type ProcedureRouter<contracts extends ProcedureContract<string, any, any>> = Router & {
    __contracts: contracts;
};

export function createProcedureRouter<procedure extends Procedure<string, any, any>>(
    procedures: procedure[],
): ProcedureRouter<procedure['__contract']> {
    const router = Router() as ProcedureRouter<procedure['__contract']>;

    console.info('Registering procedures:');

    for (const procedure of procedures) {
        console.info(`  - Registering procedure: ${procedure.procedureName}`);
        router.use(procedure);
    }

    return router;
}
