import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    signal,
    viewChild,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { regexValidator } from '@app/shared/validators/regex.validator';
import { CdkConnectedOverlay, CdkOverlayOrigin, ViewportRuler } from '@angular/cdk/overlay';
import { MatError, MatFormField, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatPasswordToggleButtonComponent } from '@app/shared/components/mat-password-toggle-button/mat-password-toggle-button.component';
import { MatTooltipEllipsisDirective } from '@app/shared/directives/mat-tooltip-ellipsis.directive';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle } from '@angular/material/card';
import { RxLet } from '@rx-angular/template/let';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { SnackBarService } from '@app/core/services/snack-bar.service';
import { rxEffect } from 'ngxtension/rx-effect';
import { debounceTime, filter } from 'rxjs';
import { EmailRoutedLayoutComponent } from '@app/shared/layouts/email-routed-layout/email-routed-layout.component';
import { MatAnchor, MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { AlertComponent } from '@app/shared/components/alert/alert.component';

@Component({
    selector: 'app-reset-password-page',
    standalone: true,
    imports: [
        MatIcon,
        CdkConnectedOverlay,
        ReactiveFormsModule,
        MatFormField,
        CdkOverlayOrigin,
        MatInput,
        MatSuffix,
        MatPasswordToggleButtonComponent,
        MatTooltipEllipsisDirective,
        MatCard,
        MatHint,
        MatError,
        MatCardHeader,
        MatCardSubtitle,
        MatCardContent,
        RxLet,
        MatLabel,
        EmailRoutedLayoutComponent,
        MatButton,
        MatTooltip,
        MatAnchor,
        RouterLink,
        AlertComponent,
    ],
    template: `
        <app-email-routed-layout title="Reset your password" icon="password">
            @if (!updated()) {
                <p>Enter your new password below.</p>

                <form class="grid w-full gap-2" [formGroup]="form" (ngSubmit)="onSubmit()">
                    @if (failed()) {
                        <app-alert>
                            <span heading>Failed to update password.</span> Link may have expired.
                        </app-alert>
                    }

                    <mat-form-field cdkOverlayOrigin #trigger="cdkOverlayOrigin">
                        <mat-label>New password</mat-label>
                        <input
                            matInput
                            id="password"
                            type="password"
                            [formControl]="form.controls.password"
                            #passwordInput
                            (focus)="openOverlay()"
                            (input)="openOverlay()"
                            (blur)="onBlur($event)"
                        />
                        <mat-password-toggle-button
                            matSuffix
                            [inputElement]="passwordInput"
                            [disabled]="update.isPending()"
                        />
                        <mat-hint>
                            @if (!form.controls.password.value) {
                                Choose a strong password
                            }
                        </mat-hint>
                        <mat-error matTooltipEllipsis>
                            @if (form.controls.password.hasError('required')) {
                                Password is required
                            } @else if (form.controls.password.hasError('minlength')) {
                                Must be at least 8 characters long
                            } @else if (form.controls.password.hasError('uppercase')) {
                                Must contain at least 1 uppercase letter
                            } @else if (form.controls.password.hasError('lowercase')) {
                                Must contain at least 1 lowercase letter
                            } @else if (form.controls.password.hasError('number')) {
                                Must contain at least 1 number
                            } @else if (form.controls.password.hasError('special')) {
                                Must contain at least 1 special character
                            }
                        </mat-error>
                    </mat-form-field>

                    <ng-template
                        cdkConnectedOverlay
                        [cdkConnectedOverlayWidth]="triggerRect()?.width || 0"
                        [cdkConnectedOverlayOrigin]="trigger"
                        [cdkConnectedOverlayOpen]="isOpen()"
                        #overlay="cdkConnectedOverlay"
                    >
                        <mat-card
                            [tabIndex]="overlayFocusable() ? 0 : -1"
                            class="-mt-4 mb-2 w-full bg-white"
                            (mousedown)="onOverlayMouseDown($event)"
                            (blur)="onOverlayBlur($event)"
                        >
                            <mat-card-header>
                                <mat-card-subtitle>
                                    Password must follow these rules
                                </mat-card-subtitle>
                            </mat-card-header>
                            <mat-card-content>
                                <ul class="grid gap-1">
                                    <li
                                        class="flex items-center"
                                        *rxLet="
                                            form.controls.password.hasError('minlength');
                                            let error
                                        "
                                    >
                                        @if (error) {
                                            <mat-icon>close</mat-icon>
                                        } @else {
                                            <mat-icon>done</mat-icon>
                                        }
                                        <span [class.line-through]="!error">
                                            At least 8 characters
                                        </span>
                                    </li>
                                    <li
                                        class="flex items-center"
                                        *rxLet="
                                            form.controls.password.hasError('uppercase');
                                            let error
                                        "
                                    >
                                        @if (error) {
                                            <mat-icon>close</mat-icon>
                                        } @else {
                                            <mat-icon>done</mat-icon>
                                        }
                                        <span [class.line-through]="!error">
                                            At least 1 uppercase letter
                                        </span>
                                    </li>
                                    <li
                                        class="flex items-center"
                                        *rxLet="
                                            form.controls.password.hasError('lowercase');
                                            let error
                                        "
                                    >
                                        @if (error) {
                                            <mat-icon>close</mat-icon>
                                        } @else {
                                            <mat-icon>done</mat-icon>
                                        }
                                        <span [class.line-through]="!error">
                                            At least 1 lowercase letter
                                        </span>
                                    </li>
                                    <li
                                        class="flex items-center"
                                        *rxLet="
                                            form.controls.password.hasError('number');
                                            let error
                                        "
                                    >
                                        @if (error) {
                                            <mat-icon>close</mat-icon>
                                        } @else {
                                            <mat-icon>done</mat-icon>
                                        }
                                        <span [class.line-through]="!error">
                                            At least 1 number
                                        </span>
                                    </li>
                                    <li
                                        class="flex items-center"
                                        *rxLet="
                                            form.controls.password.hasError('special');
                                            let error
                                        "
                                    >
                                        @if (error) {
                                            <mat-icon>close</mat-icon>
                                        } @else {
                                            <mat-icon>done</mat-icon>
                                        }
                                        <span [class.line-through]="!error">
                                            At least 1 special character
                                        </span>
                                    </li>
                                </ul>
                            </mat-card-content>
                        </mat-card>
                    </ng-template>

                    <mat-form-field>
                        <mat-label>Confirm new password</mat-label>
                        <input
                            matInput
                            id="confirmPassword"
                            type="password"
                            [formControl]="form.controls.confirmPassword"
                            #confirmInput
                        />
                        <mat-password-toggle-button
                            matSuffix
                            [inputElement]="confirmInput"
                            [disabled]="update.isPending()"
                        />
                        <mat-hint>
                            @if (!form.controls.confirmPassword.value) {
                                Confirm your password
                            }
                        </mat-hint>
                        <mat-error matTooltipEllipsis>
                            @if (form.controls.confirmPassword.hasError('required')) {
                                Password confirmation is required
                            } @else if (form.controls.confirmPassword.hasError('notEqual')) {
                                Passwords do not match
                            }
                        </mat-error>
                    </mat-form-field>

                    <button
                        mat-flat-button
                        [disabledInteractive]="update.isPending()"
                        [matTooltip]="update.isPending() ? 'Please wait' : ''"
                        type="submit"
                        class="btn-primary mt-2"
                    >
                        Reset password
                    </button>

                    <a mat-stroked-button class="btn-secondary" routerLink="/login">
                        Back to login
                    </a>
                </form>
            }
            @if (updated()) {
                <p>Your password has been updated.</p>
                <a mat-stroked-button class="btn-secondary" routerLink="/login"> Back to login </a>
            }
        </app-email-routed-layout>
    `,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordPageComponent {
    #fb = inject(FormBuilder);
    #rpcClient = injectRpcClient();
    #snackbar = inject(SnackBarService);
    #viewportRuler = inject(ViewportRuler);

    token = input<string>();

    form = this.#fb.group(
        {
            password: [
                '',
                [
                    Validators.required,
                    regexValidator(/.{8,}/, 'minlength'),
                    regexValidator(/^.{0,30}$/, 'maxlength'),
                    regexValidator(/[a-z]/, 'lowercase'),
                    regexValidator(/[A-Z]/, 'uppercase'),
                    regexValidator(/[0-9]/, 'number'),
                    regexValidator(/[^a-zA-Z0-9]/, 'special'),
                ],
            ],
            confirmPassword: ['', [Validators.required]],
        },
        {
            validators: [
                (control) => {
                    const passwordControl = control.get('password');
                    const confirmPasswordControl = control.get('confirmPassword');

                    if (!passwordControl?.value || !confirmPasswordControl?.value) {
                        return null;
                    }
                    if (passwordControl.value !== confirmPasswordControl.value) {
                        confirmPasswordControl.setErrors({ notEqual: true });
                        return null;
                    }
                    confirmPasswordControl.setErrors(null);
                    return null;
                },
            ],
        },
    );

    update = injectMutation(() => ({
        mutationFn: this.#rpcClient.resetPassword,
        onSuccess: async () => {
            this.#snackbar.enqueueSnackBar('Password updated');
        },
        onError: async () => {
            this.#snackbar.enqueueSnackBar('Failed to update password');
        },
    }));

    updated = computed(() => this.update.isSuccess());
    failed = computed(() => this.update.isError());

    onSubmit() {
        if (this.form.invalid) {
            return;
        }
        const token = this.token();
        const password = this.form.controls.password.value;

        if (!token || !password) {
            return;
        }
        this.update.mutate({ token, password });
    }

    // Password overlay

    isOpen = signal(false);
    triggerRect = signal<DOMRect | null>(null);
    overlayFocusable = signal(false);

    trigger = viewChild.required<CdkOverlayOrigin>('trigger');
    passwordInput = viewChild.required<HTMLElement>('passwordInput');
    overlay = viewChild<CdkConnectedOverlay>('overlay');

    #resizeOverlayEffect = rxEffect(
        this.#viewportRuler.change().pipe(
            debounceTime(200),
            filter(() => this.isOpen()),
        ),
        () => this.#resizeOverlay(),
    );

    openOverlay() {
        this.#resizeOverlay();
        this.isOpen.set(true);
    }

    onBlur(ev: FocusEvent) {
        const overlayElement = this.overlay()?.overlayRef?.overlayElement;
        const target = ev.relatedTarget;

        if (
            !(target instanceof HTMLElement) ||
            (overlayElement && target !== overlayElement && !overlayElement.contains(target))
        ) {
            this.isOpen.set(false);
        }
    }

    #resizeOverlay() {
        this.triggerRect.set(this.trigger().elementRef.nativeElement.getBoundingClientRect());
    }

    onOverlayMouseDown(ev: MouseEvent) {
        if (ev.target instanceof HTMLElement) {
            this.overlayFocusable.set(true);
            ev.target.focus();
        }
    }

    onOverlayBlur(ev: FocusEvent) {
        this.overlayFocusable.set(false);
        if (ev.relatedTarget !== this.passwordInput()) {
            this.isOpen.set(false);
        }
    }
}
