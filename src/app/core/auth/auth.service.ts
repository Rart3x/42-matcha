import { inject, Injectable } from '@angular/core';
import {
    distinctUntilChanged,
    map,
    merge,
    Observable,
    ReplaySubject,
    shareReplay,
    tap,
} from 'rxjs';
import { LoggerService } from '@app/core/services/logger.service';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { Router } from '@angular/router';

/**
 * Service that handles the authentication of the user.
 */
@Injectable({
    providedIn: 'root',
})
export class AuthService {
    #router = inject(Router);
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
                    this.#logger.info(`User ${username} logged in.`);
                } else {
                    this.#logger.warn(`User ${username} failed to log in.`);
                }
            }),
            tap((res) => this.#isAuthenticatedSubject.next(res.ok)),
            map((res) => res.ok),
        );
    }

    /**
     * Logs out the user.
     *
     * @returns An observable that emits `true` if the logout was successful, `false` otherwise.
     */
    logout(): Observable<boolean> {
        return this.#rpcClient.logout().pipe(
            tap((res) => {
                if (res.ok) {
                    this.#logger.info('User logged out.');
                } else {
                    this.#logger.error(`Failed to log out: ${res.error}`);
                }
            }),
            tap(() => this.#isAuthenticatedSubject.next(false)),
            tap(() => this.#router.navigate(['/login'])),
            map((res) => res.ok),
        );
    }

    /**
     * Pings the server to check if the user is authenticated.
     *
     * @private
     */
    #verify(): Observable<boolean> {
        return this.#rpcClient.verify().pipe(
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
