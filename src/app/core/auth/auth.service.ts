import { inject, Injectable } from '@angular/core';
import {
    distinctUntilChanged,
    map,
    merge,
    Observable,
    of,
    ReplaySubject,
    shareReplay,
    tap,
} from 'rxjs';
import { LoggerService } from '@app/core/services/logger.service';
import { injectRpcClient } from '@app/core/http/rpc-client';

/**
 * Service that handles the authentication of the user.
 */
@Injectable({
    providedIn: 'root',
})
export class AuthService {
    #logger = inject(LoggerService);
    #rpcClient = injectRpcClient();

    #isAuthenticatedSubject = new ReplaySubject<boolean>(1);

    /**
     * Observable that emits the authentication status.
     */
    isAuthenticated$: Observable<boolean> = merge(
        this.#verify(),
        this.#isAuthenticatedSubject,
    ).pipe(distinctUntilChanged(), shareReplay(1));

    /**
     * Logs in the user.
     *
     * @param username
     * @param password
     * @returns An observable that emits `true` if the login was successful, `false` otherwise.
     */
    login(username: string, password: string): Observable<boolean> {
        return this.#rpcClient.login({ username, password }).pipe(
            tap((res) => {
                if (res.ok) {
                    this.#isAuthenticatedSubject.next(true);
                } else {
                    this.#isAuthenticatedSubject.next(false);
                }
            }),
            map((res) => {
                if (res.ok) {
                    this.#logger.info(`User ${username} logged in.`);
                    return true;
                } else {
                    this.#logger.warn(`User ${username} failed to log in.`);
                    return false;
                }
            }),
        );
    }

    /**
     * Logs out the user.
     *
     * @returns An observable that emits `true` if the logout was successful, `false` otherwise.
     */
    logout(): Observable<boolean> {
        this.#logger.info('Logging out...');
        // TODO: Implement the logout logic
        return of(true);
    }

    /**
     * Pings the server to check if the user is authenticated.
     *
     * @private
     */
    #verify(): Observable<boolean> {
        return this.#rpcClient.verify({}).pipe(
            map((res) => {
                if (res.ok) {
                    this.#logger.info('User is authenticated.');
                    return true;
                } else {
                    this.#logger.warn('User is not authenticated.');
                    return false;
                }
            }),
        );
    }
}
