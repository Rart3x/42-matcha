import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthLayoutComponent } from '@app/core/auth/auth-layout/auth-layout.component';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { fromApiValidator } from '@app/shared/validators/from-api-validator';
import { usernameValidators } from '@api/validators/username.validators';

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
    protected readonly Object = Object;
}
