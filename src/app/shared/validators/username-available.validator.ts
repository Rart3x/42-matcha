import { Injector } from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { injectQueryClient } from '@tanstack/angular-query-experimental';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { map, Observable, switchMap, timer } from 'rxjs';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';

/**
 * Injects a validator function that checks if a username is available.
 * @note This function is meant to be used in a reactive form.
 * @note The error key is `available`.
 */
export function injectUsernameAvailableValidator(injector?: Injector) {
    return assertInjector(injectUsernameAvailableValidator, injector, () => {
        const rpcClient = injectRpcClient();
        const queryClient = injectQueryClient();

        return (control: AbstractControl): Observable<ValidationErrors | null> =>
            timer(300).pipe(
                switchMap(() =>
                    fromPromise(
                        queryClient.ensureQueryData({
                            queryKey: ['username-available', control.value],
                            queryFn: () => rpcClient.usernameAvailable({ username: control.value }),
                            staleTime: /* 5min */ 1000 * 60 * 5,
                        }),
                    ),
                ),
                map((res) => {
                    if (res.available === 'true') {
                        return null;
                    }
                    return { available: true };
                }),
            );
    });
}
