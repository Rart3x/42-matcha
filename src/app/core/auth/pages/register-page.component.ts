import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthLayoutComponent } from '@app/core/auth/layouts/auth-layout.component';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
    MAT_FORM_FIELD_DEFAULT_OPTIONS,
    MatFormFieldModule,
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPasswordToggleButtonComponent } from '@app/shared/components/mat-password-toggle-button/mat-password-toggle-button.component';

@Component({
    selector: 'app-register-page',
    standalone: true,
    imports: [
        AuthLayoutComponent,
        MatButtonModule,
        RouterModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatPasswordToggleButtonComponent,
    ],
    providers: [
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: { appearance: 'outline' },
        },
    ],
    template: `
        <h1>Sign up</h1>
        <p>Sign up to start meeting new people</p>

        <form [formGroup]="registerForm" class="grid grid-cols-2 gap-2">
            <mat-form-field>
                <mat-label>First name</mat-label>
                <input
                    matInput
                    type="text"
                    [formControl]="registerForm.controls.firstName"
                />
                @if (!registerForm.controls.username.value) {
                    <mat-hint>Enter your first name</mat-hint>
                }
            </mat-form-field>

            <mat-form-field>
                <mat-label>Last name</mat-label>
                <input
                    matInput
                    type="text"
                    [formControl]="registerForm.controls.lastName"
                />
                @if (!registerForm.controls.username.value) {
                    <mat-hint>Enter your last name</mat-hint>
                }
            </mat-form-field>

            <mat-form-field class="col-span-2">
                <mat-label>Email</mat-label>
                <input
                    matInput
                    type="text"
                    [formControl]="registerForm.controls.email"
                />
                @if (!registerForm.controls.username.value) {
                    <mat-hint>Enter a valid email address</mat-hint>
                }
            </mat-form-field>

            <mat-form-field class="col-span-2">
                <mat-label>Username</mat-label>
                <input
                    matInput
                    type="text"
                    [formControl]="registerForm.controls.username"
                />
                @if (!registerForm.controls.username.value) {
                    <mat-hint>Choose a username</mat-hint>
                }
            </mat-form-field>

            <mat-form-field class="col-span-2">
                <mat-label>Password</mat-label>
                <input
                    matInput
                    type="password"
                    [formControl]="registerForm.controls.password"
                    #passwordInput
                />
                <mat-password-toggle-button
                    matSuffix
                    [inputElement]="passwordInput"
                />
                @if (!registerForm.controls.password.value) {
                    <mat-hint>Choose a strong password</mat-hint>
                }
            </mat-form-field>

            <mat-form-field class="col-span-2">
                <mat-label>Confirm password</mat-label>
                <input
                    matInput
                    type="password"
                    [formControl]="registerForm.controls.confirmPassword"
                    #confirmInput
                />
                <mat-password-toggle-button
                    matSuffix
                    [inputElement]="confirmInput"
                />
                @if (!registerForm.controls.confirmPassword.value) {
                    <mat-hint>Confirm your password</mat-hint>
                }
            </mat-form-field>

            <button
                type="submit"
                class="btn-primary col-span-2 mt-2"
                mat-flat-button
                [disabled]="registerForm.invalid"
            >
                Sign up
            </button>
        </form>
    `,
    host: { class: 'grid medium:min-w-72 large:min-w-80 xlarge:min-w-96' },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageComponent {
    #fb = inject(NonNullableFormBuilder);

    registerForm = this.#fb.group({
        email: [''],
        username: [''],
        password: [''],
        confirmPassword: [''],
        firstName: [''],
        lastName: [''],
    });
}
