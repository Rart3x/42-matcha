import type { Procedures } from '@api/api';
import { inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

type RpcClient = {
    [procedure in Procedures['name']]: (
        data: Extract<Procedures, { name: procedure }>['__params'],
    ) => Observable<
        | {
              ok: true;
              data: Extract<Procedures, { name: procedure }>['__response'];
          }
        | {
              ok: false;
              error: Extract<Procedures, { name: procedure }>['__error'];
          }
    >;
};

export function injectRpcClient(): RpcClient {
    const http = inject(HttpClient);

    return new Proxy(
        {},
        {
            get: (_, procedure: Procedures['name']) => {
                return (data: any) =>
                    http
                        .post<
                            Extract<Procedures, { name: typeof procedure }>['__response']
                        >(`/api/${procedure}`, data)
                        .pipe(
                            map((response) => ({
                                ok: true,
                                data: response,
                            })),
                            catchError((error: HttpErrorResponse) =>
                                of({
                                    ok: false,
                                    error: error.error?.error || 'Unknown error',
                                }),
                            ),
                        );
            },
        },
    ) as RpcClient;
}
