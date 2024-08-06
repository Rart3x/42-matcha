import { ApiValidator, validate } from '@api/validators/ApiValidator';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function fromApiValidator(apiValidators: ApiValidator[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value as string | undefined;

        const errors = validate(value, apiValidators);

        return errors.length > 0
            ? Object.fromEntries(
                  errors.map((error) => [error.name, error.message]),
              )
            : null;
    };
}
