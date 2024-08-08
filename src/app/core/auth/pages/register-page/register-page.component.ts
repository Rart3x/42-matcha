import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthLayoutComponent } from '@app/core/auth/auth-layout/auth-layout.component';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import {
    NonNullableFormBuilder,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';
import { regexpValidator } from '@app/shared/validators/regexp.validator';
import { controlsMatchValidator } from '@app/shared/validators/controls-match.validator';

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
    ],
    templateUrl: './register-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageComponent {
    #fb = inject(NonNullableFormBuilder);

    registerForm = this.#fb.group({
        loginInfoStep: this.#fb.group({
            email: ['', [Validators.required, Validators.email]],
            username: [
                '',
                [
                    Validators.required,
                    Validators.minLength(3),
                    Validators.maxLength(20),
                    Validators.pattern(/^[a-zA-Z0-9]+$/),
                ],
            ],
        }),
        personalInfoStep: this.#fb.group({
            firstName: [
                '',
                [
                    Validators.required,
                    Validators.minLength(2),
                    Validators.maxLength(20),
                    regexpValidator(/^[a-zA-Z ]+$/, 'onlyAlpha'),
                    regexpValidator(/^[^ ]/, 'noLeadingSpace'),
                    regexpValidator(/[^ ]$/, 'noTrailingSpace'),
                ],
            ],
            lastName: [
                '',
                [
                    Validators.required,
                    Validators.minLength(2),
                    Validators.maxLength(20),
                    regexpValidator(/^[a-zA-Z ]+$/, 'onlyAlpha'),
                    regexpValidator(/^[^ ]/, 'noLeadingSpace'),
                    regexpValidator(/[^ ]$/, 'noTrailingSpace'),
                ],
            ],
        }),
        passwordStep: this.#fb.group(
            {
                password: [
                    '',
                    [
                        Validators.required,
                        Validators.minLength(8),
                        Validators.maxLength(100),
                        regexpValidator(/[a-z]/, 'noLowercase'),
                        regexpValidator(/[A-Z]/, 'noUppercase'),
                        regexpValidator(/\d/, 'noDigit'),
                        regexpValidator(/[^a-zA-Z0-9]/, 'noSpecialCharacter'),
                    ],
                ],
                confirmPassword: ['', [Validators.required]],
            },
            {
                validators: [
                    controlsMatchValidator('password', 'confirmPassword'),
                ],
            },
        ),
    });

    loginInfoStep = this.registerForm.controls.loginInfoStep;
    email = this.loginInfoStep.controls.email;
    username = this.loginInfoStep.controls.username;

    personalInfoStep = this.registerForm.controls.personalInfoStep;
    firstName = this.personalInfoStep.controls.firstName;
    lastName = this.personalInfoStep.controls.lastName;

    passwordStep = this.registerForm.controls.passwordStep;
    password = this.passwordStep.controls.password;
    confirmPassword = this.passwordStep.controls.confirmPassword;
}
