import type { Procedures } from '@api/api';
import { HttpClient } from '@angular/common/http';
import { inject, isSignal, Signal } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { catchError, lastValueFrom } from 'rxjs';

type _ = Procedures;

// export function injectRpcQuery<procedure extends ExtractVoidParamsProcedure<Procedures>>(
//     name: procedure['name'],
// ): ReturnType<typeof injectQuery>;
//
// export function injectRpcQuery<procedure extends ExtractNonVoidParamsProcedure<Procedures>>(
//     name: procedure['name'],
//     params: Signal<procedure['__params']> | procedure['__params'],
// ): ReturnType<typeof injectQuery>;

type ExtractParams<procedure extends Procedures['name']> = Extract<
    Procedures,
    { name: procedure }
>['__params'];
type ExtractResponse<procedure extends Procedures['name']> = Extract<
    Procedures,
    { name: procedure }
>['__response'];
type ExtractError<procedure extends Procedures['name']> = Extract<
    Procedures,
    { name: procedure }
>['__error'];

export function injectRpcQuery<procedure extends Procedures>(
    name: procedure['name'],
    params?: Signal<procedure['__params']> | procedure['__params'],
) {
    const http = inject(HttpClient);

    return injectQuery<procedure['__response'], procedure['__error']>(() => ({
        queryKey: ['procedure', name, isSignal(params) ? params() : params],
        queryFn: ({ queryKey }) =>
            lastValueFrom(
                http.post<procedure['__response']>(`/api/${name}`, queryKey[2]).pipe(
                    catchError((error) => {
                        throw error.error;
                    }),
                ),
            ),
    }));
}
