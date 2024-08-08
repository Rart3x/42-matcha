import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function regexpValidator(regexp: RegExp, error: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (control.value === null || control.value === undefined) {
            return null;
        }

        return regexp.test(control.value) ? null : { [error]: true };
    };
}
