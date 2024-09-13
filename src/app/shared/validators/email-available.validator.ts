import { injectRpcClient } from '@app/core/http/rpc-client';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { map, Observable, switchMap, timer } from 'rxjs';
import { Injector } from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';
import { injectQueryClient } from '@tanstack/angular-query-experimental';

/**
 * Injects a validator function that checks if an email is available.
 * @note This function is meant to be used in a reactive form.
 * @note The error key is `available`.
 */
export function injectEmailAvailableValidator(injector?: Injector) {
    return assertInjector(injectEmailAvailableValidator, injector, () => {
        const rpcClient = injectRpcClient();
        const queryClient = injectQueryClient();

        return (control: AbstractControl): Observable<ValidationErrors | null> =>
            timer(300).pipe(
                switchMap(() =>
                    queryClient.ensureQueryData({
                        queryKey: ['email-available', control.value],
                        queryFn: () => rpcClient.emailAvailable({ email: control.value }),
                        staleTime: /* 5min */ 1000 * 60 * 5,
                    }),
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
