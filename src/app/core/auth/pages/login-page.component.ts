import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthLayoutComponent } from '@app/core/auth/layouts/auth-layout.component';
import { Router, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SnackBarService } from '@app/core/services/snack-bar.service';
import { MatPasswordToggleButtonComponent } from '@app/shared/components/mat-password-toggle-button/mat-password-toggle-button.component';
import { FormDisabledDirective } from '@app/shared/directives/form-disabled.directive';
import { injectMutation, injectQueryClient } from '@tanstack/angular-query-experimental';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { RxLet } from '@rx-angular/template/let';
import { AlertComponent } from '@app/shared/components/alert/alert.component';

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
        RxLet,
        AlertComponent,
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
            [formGroup]="form"
            [appFormDisabled]="login.isPending()"
            (ngSubmit)="onSubmit()"
        >
            @if (login.isError()) {
                <app-alert>
                    <ng-container heading>Login failed.</ng-container>
                    Invalid credentials
                </app-alert>
            }

            <mat-form-field *rxLet="form.controls.username as username">
                <mat-label>Username</mat-label>
                <mat-icon matPrefix>person</mat-icon>
                <input id="username" matInput [formControl]="username" placeholder="Username" />
                <mat-hint>
                    @if (!username.value) {
                        Enter your username
                    }
                </mat-hint>
                <mat-error>Username is required</mat-error>
            </mat-form-field>

            <mat-form-field *rxLet="form.controls.password as password">
                <mat-label>Password</mat-label>
                <mat-icon matPrefix>password</mat-icon>
                <input
                    [formControl]="password"
                    matInput
                    #passwordInput
                    id="password"
                    placeholder="Password"
                />
                <mat-password-toggle-button
                    matSuffix
                    [inputElement]="passwordInput"
                    [disabled]="login.isPending()"
                />
                <mat-hint>
                    @if (password.value) {
                        Enter your password
                    }
                </mat-hint>
                <mat-error>Password is required</mat-error>
            </mat-form-field>

            <button
                mat-flat-button
                class="btn-primary mt-2"
                matTooltip="Sign in"
                [disabled]="login.isPending()"
            >
                @if (login.isPending()) {
                    <mat-spinner diameter="20"></mat-spinner>
                } @else {
                    Meet new people
                }
            </button>
        </form>
    `,
    host: {
        class: 'h-fit grid w-full medium:w-96 large:w-[28rem] xlarge:w-[32rem]',
    },
})
export class LoginPageComponent implements AfterViewInit {
    #fb = inject(NonNullableFormBuilder);
    #router = inject(Router);
    #snackBar = inject(SnackBarService);
    #rpcClient = injectRpcClient();
    #queryClient = injectQueryClient();

    form = this.#fb.group({
        username: ['', Validators.required],
        password: ['', Validators.required],
    });

    login = injectMutation(() => ({
        mutationFn: this.#rpcClient.login,
        onSuccess: async () => {
            this.#snackBar.enqueueSnackBar('Login successful');
            await this.#queryClient.invalidateQueries({ queryKey: ['verifySession'] });
            await this.#router.navigate(['/home']);
        },
        onError: () => {
            this.#snackBar.enqueueSnackBar('Login failed');
        },
    }));

    passwordInput = viewChild.required<ElementRef<HTMLInputElement>>('passwordInput');

    ngAfterViewInit() {
        const initialUsername = window.history.state?.username ?? '';

        if (initialUsername !== '') {
            this.form.controls.username.setValue(initialUsername);
            this.passwordInput().nativeElement.focus();
        }
    }

    onSubmit() {
        const { username, password } = this.form.value;

        if (this.form.valid && !!username && !!password) {
            this.login.mutate({ username, password });
        }
    }
}
