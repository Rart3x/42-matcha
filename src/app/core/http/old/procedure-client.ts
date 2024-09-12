// import type {
//     ExtractErrors,
//     ExtractName,
//     ExtractParams,
//     ExtractProcedures,
//     ExtractReturns,
//     ProcedureContract,
//     ProcedureRouter,
// } from '../../../api-old/lib-2/procedure';
//
// import type { ProcedureContracts } from '../../../api-old/api';
//
// import { CreateQueryResult, injectQuery } from '@tanstack/angular-query-experimental';
// import { inject, isSignal, Signal } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { catchError, lastValueFrom } from 'rxjs';
//
// type ExtractVoidParamsContract<contract extends ProcedureContract<any, any, any, any>> =
//     contract extends ProcedureContract<any, void, any, any> ? contract : never;
//
// type ExtractNonVoidParamsContract<contract extends ProcedureContract<any, any, any, any>> =
//     contract extends ProcedureContract<any, void, any, any> ? never : contract;
//
// export type ProcedureClientMethod<contract extends ProcedureContract<any, any, any, any>> = (
//     ...args: ExtractParams<contract>
// ) => Promise<ExtractReturns<contract>>;
//
// export type ProcedureClient<router extends ProcedureRouter<any>> = {
//     [procedure in ExtractProcedures<router>['__name']]: ProcedureClientMethod<router[procedure]> &
//         router[procedure];
// };
//
// export function injectProcedureQuery<
//     contract extends ExtractVoidParamsContract<ProcedureContracts>,
// >(
//     name: ExtractName<contract>,
// ): CreateQueryResult<ExtractReturns<contract>, ExtractErrors<contract>>;
//
// export function injectProcedureQuery<
//     contract extends ExtractNonVoidParamsContract<ProcedureContracts>,
// >(
//     name: ExtractName<contract>,
//     params: Signal<ExtractParams<contract>> | ExtractParams<contract>,
// ): CreateQueryResult<ExtractReturns<contract>, ExtractErrors<contract>>;
//
// export function injectProcedureQuery<contract extends ProcedureContracts>(
//     name: ExtractName<contract>,
//     params?: Signal<ExtractParams<contract>> | ExtractParams<contract>,
// ) {
//     const http = inject(HttpClient);
//
//     return injectQuery<ExtractReturns<contract>, ExtractErrors<contract>>(() => ({
//         queryKey: ['procedure', name, isSignal(params) ? params() : params],
//         queryFn: ({ queryKey }) =>
//             lastValueFrom(
//                 http.post<ExtractReturns<contract>>(`/api/${name}`, queryKey[2]).pipe(
//                     catchError((error) => {
//                         throw error.error;
//                     }),
//                 ),
//             ),
//     }));
// }
