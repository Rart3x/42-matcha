import { AbstractControl, ValidatorFn } from '@angular/forms';

/**
 * Returns a validator function that checks if the control value matches the regex.
 * @note While the angular native pattern validator has a similar functionality, this function is more flexible.
 * as it allows you to define a custom error key. Which enables to have multiple regex validators for the same control.
 */
export function regexValidator(regex: RegExp, error: string): ValidatorFn {
    return (control: AbstractControl<string, string>) => {
        const pass = regex.test(control.value);
        return pass ? null : { [error]: true };
    };
}
