import { injectMutation, injectQueryClient } from '@tanstack/angular-query-experimental';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { SnackBarService } from '@app/core/services/snack-bar.service';
import { inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { assertInjector } from 'ngxtension/assert-injector';

/**
 * Injects a mutation that logs the user out
 * @param injector The injector to use
 * @returns The mutation
 */
export function injectLogoutMutation(injector?: Injector) {
    return assertInjector(injectLogoutMutation, injector, () => {
        const rpcClient = injectRpcClient();
        const snackBar = inject(SnackBarService);
        const queryClient = injectQueryClient();
        const router = inject(Router);

        return injectMutation(() => ({
            mutationFn: rpcClient.logout,
            onSuccess: async () => {
                await queryClient.invalidateQueries({ queryKey: ['verifySession'] });
                await router.navigate(['/login']);
                snackBar.enqueueSnackBar('You have been logged out');
            },
            onError: () => {
                snackBar.enqueueSnackBar('Failed to logout');
            },
        }));
    });
}
