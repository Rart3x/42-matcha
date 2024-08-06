import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthLayoutComponent } from '@app/core/auth/auth-layout/auth-layout.component';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

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
            email: this.#fb.nonNullable.control(''),
            username: this.#fb.nonNullable.control(''),
        }),
        passwordStep: this.#fb.nonNullable.group({
            password: this.#fb.nonNullable.control(''),
            confirmPassword: this.#fb.nonNullable.control(''),
        }),
        personalInfoStep: this.#fb.nonNullable.group({
            firstName: this.#fb.nonNullable.control(''),
            lastName: this.#fb.nonNullable.control(''),
        }),
    });
}
