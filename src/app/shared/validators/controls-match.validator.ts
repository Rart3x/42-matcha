import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const controlsMatchValidator = function (
    controlName: string,
    matchingControlName: string,
): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
        const control = formGroup.get(controlName);
        const matchingControl = formGroup.get(matchingControlName);

        if (!control) {
            throw new Error(`Control ${controlName} not found in form group`);
        }

        if (!matchingControl) {
            throw new Error(
                `Control ${matchingControlName} not found in form group`,
            );
        }

        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({ controlsMismatch: true });
        } else {
            matchingControl.setErrors(null);
        }

        return null;
    };
};
