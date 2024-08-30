import { AbstractControl, ValidatorFn } from '@angular/forms';

export function regexValidator(regex: RegExp, error: string): ValidatorFn {
    return (control: AbstractControl<string, string>) => {
        const pass = regex.test(control.value);
        return pass ? null : { [error]: true };
    };
}
