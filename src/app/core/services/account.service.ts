import { inject, Injectable } from '@angular/core';
import { injectRpcClient } from '@app/core/http/old/rpc-client';
import { tap } from 'rxjs';
import { LoggerService } from '@app/core/services/logger.service';
import { SnackBarService } from '@app/core/services/snack-bar.service';

@Injectable({
    providedIn: 'root',
})
export class AccountService {
    #rpc = injectRpcClient();
    #logger = inject(LoggerService);
    #snackbar = inject(SnackBarService);

    createAccount(
        email: string,
        username: string,
        password: string,
        firstName: string,
        lastName: string,
    ) {
        return this.#rpc.createAccount({ email, username, password, firstName, lastName }).pipe(
            tap((res) => {
                if (res.ok) {
                    this.#logger.info('Account created');
                    this.#snackbar.enqueueSnackBar('Account created');
                } else {
                    this.#logger.warn(`Failed to create account: ${res.error}`);
                    this.#snackbar.enqueueSnackBar(`Failed to create account`);
                }
            }),
        );
    }
}
