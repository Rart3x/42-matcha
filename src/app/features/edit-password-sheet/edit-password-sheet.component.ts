import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { SidesheetComponent } from '@app/shared/layouts/sidesheet-layout/sidesheet.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatError, MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { CdkConnectedOverlay, CdkOverlayOrigin, ViewportRuler } from '@angular/cdk/overlay';
import { MatTooltipEllipsisDirective } from '@app/shared/directives/mat-tooltip-ellipsis.directive';
import { MatPasswordToggleButtonComponent } from '@app/shared/components/mat-password-toggle-button/mat-password-toggle-button.component';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle } from '@angular/material/card';
import { RxLet } from '@rx-angular/template/let';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { SnackBarService } from '@app/core/services/snack-bar.service';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { regexValidator } from '@app/shared/validators/regex.validator';
import { rxEffect } from 'ngxtension/rx-effect';
import { debounceTime, filter } from 'rxjs';
import { AlertComponent } from '@app/shared/components/alert/alert.component';

@Component({
    selector: 'app-edit-password-sheet',
    standalone: true,
    imports: [
        SidesheetComponent,
        ReactiveFormsModule,
        MatError,
        MatFormField,
        MatHint,
        MatInput,
        MatLabel,
        MatTooltipEllipsisDirective,
        CdkConnectedOverlay,
        CdkOverlayOrigin,
        MatPasswordToggleButtonComponent,
        MatCard,
        MatCardHeader,
        MatCardSubtitle,
        MatCardContent,
        RxLet,
        MatIcon,
        MatButton,
        AlertComponent,
    ],
    template: `
        <app-sidesheet heading="Edit Password" [loading]="update.isPending()">
            <p class="mat-body-large">Update your credentials here</p>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" id="profile-form" class="grid gap-2">
                @if (update.isError()) {
                    <app-alert class="col-span-2">
                        <ng-container heading> Failed to update password </ng-container>
                        Please try again
                    </app-alert>
                }

                <mat-form-field>
                    <mat-label>Old Password</mat-label>
                    <input
                        matInput
                        id="old_password"
                        type="password"
                        [formControl]="form.controls.old_password"
                    />
                    <mat-password-toggle-button
                        matSuffix
                        [inputElement]="passwordInput"
                        [disabled]="update.isPending()"
                    />
                    <mat-hint>
                        @if (!form.controls.password.value) {
                            Enter your old password
                        }
                    </mat-hint>
                    <mat-error matTooltipEllipsis>
                        @if (form.controls.password.hasError('required')) {
                            Password is required
                        }
                    </mat-error>
                </mat-form-field>

                <mat-form-field cdkOverlayOrigin #trigger="cdkOverlayOrigin">
                    <mat-label>Password</mat-label>
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
                                    *rxLet="form.controls.password.hasError('minlength'); let error"
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
                                    *rxLet="form.controls.password.hasError('uppercase'); let error"
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
                                    *rxLet="form.controls.password.hasError('lowercase'); let error"
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
                                    *rxLet="form.controls.password.hasError('number'); let error"
                                >
                                    @if (error) {
                                        <mat-icon>close</mat-icon>
                                    } @else {
                                        <mat-icon>done</mat-icon>
                                    }
                                    <span [class.line-through]="!error"> At least 1 number </span>
                                </li>
                                <li
                                    class="flex items-center"
                                    *rxLet="form.controls.password.hasError('special'); let error"
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
                    <mat-label>Confirm password</mat-label>
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
            </form>

            <ng-container bottom-actions>
                <button type="submit" form="profile-form" mat-flat-button class="btn-primary">
                    Save
                </button>
                <button
                    type="button"
                    (click)="onReset()"
                    form="profile-form"
                    mat-stroked-button
                    class="btn-primary"
                >
                    Reset
                </button>
            </ng-container>
        </app-sidesheet>
    `,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPasswordSheetComponent {
    #fb = inject(FormBuilder);
    #snackbar = inject(SnackBarService);
    #viewportRuler = inject(ViewportRuler);
    #rpcClient = injectRpcClient();

    update = injectMutation(() => ({
        mutationFn: this.#rpcClient.updatePassword,
        onSuccess: async () => {
            this.#snackbar.enqueueSnackBar('Password updated');
        },
        onError: async () => {
            this.#snackbar.enqueueSnackBar('Failed to update password');
        },
    }));

    form = this.#fb.group(
        {
            old_password: ['', [Validators.required]],
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

    onSubmit() {
        if (this.form.valid) {
            const { old_password, password } = this.form.getRawValue();

            if (old_password && password) {
                this.update.mutate({ old_password, password });
            }
        }
    }

    onReset() {
        this.form.reset();
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
