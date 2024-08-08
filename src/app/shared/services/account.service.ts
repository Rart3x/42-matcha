import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class AccountService {
    #http = inject(HttpClient);

    usernameExists(username: string): Observable<boolean> {
        return this.#http
            .get<{
                exists?: boolean;
            }>(`/api/account/exists/username/${username}`)
            .pipe(
                map(({ exists }) => exists ?? false),
                catchError(() => of(false)),
            );
    }

    emailExists(email: string): Observable<boolean> {
        return this.#http
            .get<{ exists?: boolean }>(`/api/account/exists/email/${email}`)
            .pipe(
                map(({ exists }) => exists ?? false),
                catchError(() => of(false)),
            );
    }
}
