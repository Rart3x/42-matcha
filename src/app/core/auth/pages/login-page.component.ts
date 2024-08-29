import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    inject,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_FORM_FIELD_DEFAULT_OPTIONS,
    MatFormFieldModule,
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthLayoutComponent } from '@app/core/auth/layouts/auth-layout.component';
import { Router, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
    NonNullableFormBuilder,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { AuthService } from '@app/core/auth/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SnackBarServiceService } from '@app/core/services/snack-bar-service.service';
import { MatPasswordToggleButtonComponent } from '@app/shared/components/mat-password-toggle-button/mat-password-toggle-button.component';
import { deriveLoading } from 'ngxtension/derive-loading';
import { FormDisabledDirective } from '@app/shared/directives/form-disabled.directive';

@Component({
    selector: 'app-login-page',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        AuthLayoutComponent,
        RouterModule,
        MatTooltipModule,
        ReactiveFormsModule,
        MatProgressSpinnerModule,
        MatPasswordToggleButtonComponent,
        FormDisabledDirective,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: { appearance: 'outline' },
        },
    ],
    template: `
        <h1>Sign in</h1>
        <p>Sign in with username</p>
        <form
            class="grid gap-3"
            [formGroup]="loginForm"
            [appFormDisabled]="isSubmitting()"
            (ngSubmit)="onSubmit()"
        >
            @if (invalidCredentials()) {
                <div
                    class="bg-error mb-2 flex items-center gap-2 rounded border p-2"
                >
                    <mat-icon>error</mat-icon>
                    Invalid credentials
                </div>
            }

            <mat-form-field>
                <mat-label>Username</mat-label>
                <mat-icon matPrefix>person</mat-icon>
                <input
                    id="username"
                    matInput
                    [formControl]="loginForm.controls.username"
                    placeholder="Username"
                />
                @if (!loginForm.controls.username.value) {
                    <mat-hint>Enter your username</mat-hint>
                }
                <mat-error>Username is required</mat-error>
            </mat-form-field>

            <mat-form-field>
                <mat-label>Password</mat-label>
                <mat-icon matPrefix>password</mat-icon>
                <input
                    id="password"
                    matInput
                    [formControl]="loginForm.controls.password"
                    placeholder="Password"
                    #passwordInput
                />
                <mat-password-toggle-button
                    matSuffix
                    [inputElement]="passwordInput"
                    [disabled]="isSubmitting()"
                />
                @if (!loginForm.controls.password.value) {
                    <mat-hint>Enter your password</mat-hint>
                }
                <mat-error>Password is required</mat-error>
            </mat-form-field>

            <div class="hidden">
                <!-- Fix for weird bug with outline appearance on entry -->
                <mat-form-field appearance="outline">
                    <mat-icon matPrefix>password</mat-icon>
                    <mat-label>Password</mat-label>
                    <input matInput class="hidden" disabled />
                </mat-form-field>
            </div>

            <button
                mat-flat-button
                class="btn-primary mt-2"
                matTooltip="Sign in"
                [disabled]="isSubmitting()"
            >
                @if (isSubmitting()) {
                    <mat-spinner diameter="20"></mat-spinner>
                } @else {
                    Meet new people
                }
            </button>
        </form>
    `,
    host: { class: 'grid medium:min-w-72 large:min-w-80 xlarge:min-w-96' },
})
export class LoginPageComponent {
    #fb = inject(NonNullableFormBuilder);
    #router = inject(Router);
    #destroyRef = inject(DestroyRef);
    #authService = inject(AuthService);
    #snackBarService = inject(SnackBarServiceService);

    loginForm = this.#fb.group({
        username: ['', Validators.required],
        password: [''],
    });

    invalidCredentials = signal(false);
    isSubmitting = signal(false);

    onSubmit() {
        const { username, password } = this.loginForm.value;

        if (!this.loginForm.valid || !username || !password) {
            return;
        }

        this.#authService
            .login(username, password)
            .pipe(
                takeUntilDestroyed(this.#destroyRef),
                tap((result) => this.displayResultSnackbar(result)),
                tap((result) => {
                    console.log('result');
                    console.log(result);
                    if (result) {
                        void this.#router.navigate(['/']);
                    } else {
                        this.invalidCredentials.set(true);
                    }
                }),
                deriveLoading(),
                tap((value) => this.isSubmitting.set(value)),
            )
            .subscribe();
    }

    private displayResultSnackbar(result: boolean) {
        this.#snackBarService.enqueueSnackBar(
            result ? 'Login successful' : 'Login failed',
        );
    }
}
