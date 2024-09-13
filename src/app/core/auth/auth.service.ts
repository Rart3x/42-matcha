import { Injectable } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

/**
 * Service that handles the authentication of the user.
 */
@Injectable({
    providedIn: 'root',
})
export class AuthService {
    #rpc = injectRpcClient();

    #verifySessionQuery = injectQuery(() => ({
        queryKey: ['verifySession'],
        refetchOnWindowFocus: 'always',
        retry: false,
        staleTime: /* 10 minutes */ 1000 * 60 * 10,
        queryFn: () => this.#rpc.verifySession(),
    }));

    isLoggedIn$ = toObservable(this.#verifySessionQuery.isFetching).pipe(
        filter((isFetching) => !isFetching),
        map(() => this.#verifySessionQuery.isSuccess()),
    );
}
