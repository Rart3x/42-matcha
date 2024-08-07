import { ApiValidationError, ApiValidator } from '@api/validators/ApiValidator';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function fromApiValidator(apiValidators: ApiValidator[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value as string | undefined;

        const errors = apiValidators
            .map((validator): ApiValidationError | null => {
                if (validator.validate(value)) {
                    return null;
                }
                return { name: validator.name, message: validator.message };
            })
            .filter((error): error is ApiValidationError => error !== null);

        return errors.length > 0 ? { fromApi: errors } : null;
    };
}
