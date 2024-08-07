import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthLayoutComponent } from '@app/core/auth/auth-layout/auth-layout.component';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { fromApiValidator } from '@app/shared/validators/from-api-validator';
import { usernameValidators } from '@api/validators/username.validators';
import { AsyncPipe } from '@angular/common';
import { ValidationPipe } from '@app/shared/pipes/validation.pipe';
import { map, merge, Observable } from 'rxjs';
import { ApiValidationError } from '@api/validators/ApiValidator';

@Component({
    selector: 'app-register-page',
    standalone: true,
    imports: [
        AuthLayoutComponent,
        MatButtonModule,
        RouterModule,
        MatStepperModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        AsyncPipe,
        ValidationPipe,
    ],
    templateUrl: './register-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageComponent {
    #fb = inject(FormBuilder);

    registerForm = this.#fb.nonNullable.group({
        loginInfoStep: this.#fb.nonNullable.group({
            email: ['', [Validators.required]],
            username: [
                '',
                [Validators.required, fromApiValidator(usernameValidators)],
            ],
        }),
        passwordStep: this.#fb.nonNullable.group({
            password: ['', [Validators.required]],
            confirmPassword: ['', [Validators.required]],
        }),
        personalInfoStep: this.#fb.nonNullable.group({
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
        }),
    });

    loginInfoStep = this.registerForm.controls.loginInfoStep;
    passwordStep = this.registerForm.controls.passwordStep;
    personalInfoStep = this.registerForm.controls.personalInfoStep;

    formatError$(control: AbstractControl, group: FormGroup) {
        return merge([control.statusChanges, group.statusChanges]).pipe(
            map((): string | null => {
                if (control.hasError('required')) {
                    return 'This field is required';
                }

                if (control.hasError('fromApi')) {
                    const errors = control.getError('fromApi') as
                        | Partial<ApiValidationError>[]
                        | null;

                    if (
                        errors instanceof Array &&
                        errors.length > 0 &&
                        errors[0].message
                    ) {
                        return errors[0].message;
                    }
                }
                return null;
            }),
        );
    }
}
