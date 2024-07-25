import { inject, Injectable } from '@angular/core';
import {
    catchError,
    map,
    merge,
    Observable,
    of,
    ReplaySubject,
    shareReplay,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LoggerService } from '@app/core/services/logger.service';

/**
 * Service that handles the authentication of the user.
 */
@Injectable({
    providedIn: 'root',
})
export class AuthService {
    #http = inject(HttpClient);
    #logger = inject(LoggerService);

    #isAuthenticatedSubject = new ReplaySubject<boolean>(1);

    /**
     * Observable that emits the authentication status.
     */
    isAuthenticated$: Observable<boolean> = merge(
        this.#verify(),
        this.#isAuthenticatedSubject,
    ).pipe(shareReplay(1));

    /**
     * Logs in the user.
     *
     * @param username
     * @param password
     * @returns An observable that emits `true` if the login was successful, `false` otherwise.
     */
    login(username: string, password: string): Observable<boolean> {
        this.#logger.info(`Logging in as ${username}...`);
        // TODO: Implement the login logic
        return of(true);
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
        return this.#http.get('/api/auth/verify').pipe(
            map(() => true),
            catchError(() => of(false)),
        );
    }
}
