import {
    ChangeDetectionStrategy,
    Component,
    effect,
    inject,
    signal,
} from '@angular/core';
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
import { emailExistsValidator } from '@app/shared/validators/email-exists.validator';
import { usernameExistsValidator } from '@app/shared/validators/username-exists.validator';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { AccountService } from '@app/shared/services/account.service';
import { MatTooltip } from '@angular/material/tooltip';
import { finalize, timer } from 'rxjs';

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
        MatTooltip,
    ],
    providers: [
        {
            provide: STEPPER_GLOBAL_OPTIONS,
            useValue: { showError: true },
        },
    ],
    templateUrl: './register-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageComponent {
    #fb = inject(NonNullableFormBuilder);
    #accountService = inject(AccountService);

    registerForm = this.#fb.group({
        loginInfoStep: this.#fb.group({
            email: [
                '',
                [Validators.required, Validators.email],
                [emailExistsValidator()],
            ],
            username: [
                '',
                [
                    Validators.required,
                    Validators.minLength(3),
                    Validators.maxLength(20),
                    Validators.pattern(/^[a-zA-Z0-9]+$/),
                ],
                [usernameExistsValidator()],
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

    loading = signal(false);

    #loadingEffect = effect(() => {
        console.log('loading', this.loading());
        if (this.loading()) {
            this.registerForm.disable();
        } else {
            this.registerForm.enable();
        }
    });

    onSubmit() {
        // if (this.registerForm.invalid) {
        //     return;
        // }
        console.log(this.registerForm.value);

        this.loading.set(true);

        timer(1000)
            .pipe(
                finalize(() => {
                    this.loading.set(false);
                }),
            )
            .subscribe();
    }
}
