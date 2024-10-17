import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormDisabledDirective } from '@app/shared/directives/form-disabled.directive';
import { MatIcon } from '@angular/material/icon';
import { MatError, MatFormField, MatHint, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatAnchor, MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { AlertComponent } from '@app/shared/components/alert/alert.component';
import { RxLet } from '@rx-angular/template/let';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { SnackBarService } from '@app/core/services/snack-bar.service';

@Component({
    selector: 'app-request-password-reset-page',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        FormDisabledDirective,
        MatIcon,
        MatLabel,
        MatHint,
        MatError,
        MatPrefix,
        MatInput,
        MatTooltip,
        MatProgressSpinner,
        MatAnchor,
        RouterLink,
        MatButton,
        MatFormField,
        AlertComponent,
        RxLet,
    ],
    host: {
        class: 'h-fit grid w-full medium:w-96 large:w-[28rem] xlarge:w-[32rem]',
    },
    template: `
        <h1>Forgot password?</h1>
        <p>Enter your email address to get a password reset link</p>

        @if (!requested()) {
            <form
                class="grid gap-3"
                [formGroup]="form"
                [appFormDisabled]="request.isPending()"
                (ngSubmit)="onSubmit()"
            >
                @if (failed()) {
                    <app-alert>
                        <ng-container heading>Request failed.</ng-container>
                        Email may be invalid
                    </app-alert>
                }

                <mat-form-field *rxLet="form.controls.email as email">
                    <mat-label>Email</mat-label>
                    <mat-icon matPrefix>email</mat-icon>
                    <input id="username" matInput [formControl]="email" placeholder="Email" />
                    <mat-hint>
                        @if (!email.value) {
                            Enter your email address
                        }
                    </mat-hint>
                    <mat-error>
                        @if (email.hasError('required')) {
                            Email is required
                        } @else if (email.hasError('email')) {
                            Must be a valid email address
                        }
                    </mat-error>
                </mat-form-field>

                <button
                    mat-flat-button
                    class="btn-primary mt-2"
                    matTooltip="Sign in"
                    [disabled]="request.isPending()"
                >
                    @if (request.isPending()) {
                        <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                        Request password reset
                    }
                </button>
                <a mat-stroked-button class="btn-secondary" routerLink="/login"> Back to login </a>
            </form>
        }

        @if (requested()) {
            <p>Email sent</p>
            <a mat-stroked-button class="btn-secondary" routerLink="/login"> Back to login </a>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestPasswordResetPageComponent {
    #fb = inject(FormBuilder);
    #snackbar = inject(SnackBarService);
    #rpcClient = injectRpcClient();

    form = this.#fb.group({
        email: ['', [Validators.required, Validators.email]],
    });

    request = injectMutation(() => ({
        mutationFn: this.#rpcClient.requirePasswordReset,
        onSuccess: async () => {
            this.#snackbar.enqueueSnackBar('Email sent');
        },
        onError: async () => {
            this.#snackbar.enqueueSnackBar('Request failed');
        },
    }));

    requested = computed(() => this.request.isSuccess());
    failed = computed(() => this.request.isError());

    onSubmit() {
        if (!this.form.valid) {
            return;
        }
        const email = this.form.controls.email.value;

        if (email) {
            this.request.mutate({ email });
        }
    }
}
