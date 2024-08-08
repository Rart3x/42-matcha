import {
    AbstractControl,
    AsyncValidatorFn,
    ValidationErrors,
} from '@angular/forms';
import { map, Observable } from 'rxjs';
import { inject } from '@angular/core';
import { AccountService } from '@app/shared/services/account.service';

export function usernameExistsValidator(
    accountService = inject(AccountService),
): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        return accountService
            .usernameExists(control.value)
            .pipe(map((exists) => (exists ? { usernameExists: true } : null)));
    };
}
