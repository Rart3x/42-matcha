import {
    AbstractControl,
    AsyncValidatorFn,
    ValidationErrors,
} from '@angular/forms';
import { inject } from '@angular/core';
import { AccountService } from '@app/shared/services/account.service';
import { map, Observable } from 'rxjs';

export function emailExistsValidator(
    accountService = inject(AccountService),
): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        return accountService
            .emailExists(control.value)
            .pipe(map((exists) => (exists ? { emailExists: true } : null)));
    };
}
