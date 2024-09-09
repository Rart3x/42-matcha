import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { AuthLayoutComponent } from '@app/core/auth/layouts/auth-layout.component';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import {
    AbstractControl,
    NgForm,
    NonNullableFormBuilder,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPasswordToggleButtonComponent } from '@app/shared/components/mat-password-toggle-button/mat-password-toggle-button.component';
import { CdkConnectedOverlay, CdkOverlayOrigin, ViewportRuler } from '@angular/cdk/overlay';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle } from '@angular/material/card';
import { rxEffect } from 'ngxtension/rx-effect';
import { debounceTime, filter, iif, map, of, switchMap, tap } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { regexValidator } from '@app/shared/validators/regex.validator';
import { MatTooltipEllipsisDirective } from '@app/shared/directives/mat-tooltip-ellipsis.directive';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { RxLet } from '@rx-angular/template/let';
import { AccountService } from '@app/core/services/account.service';
import { deriveLoading } from 'ngxtension/derive-loading';
import { FormDisabledDirective } from '@app/shared/directives/form-disabled.directive';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { usernameExistsValidator } from '@app/shared/validators/username-exists.validator';
import { emailExistsValidator } from '@app/shared/validators/email-exists.validator';

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
        CdkConnectedOverlay,
        CdkOverlayOrigin,
        MatCard,
        MatCardContent,
        MatCardSubtitle,
        MatCardHeader,
        MatIcon,
        MatTooltipEllipsisDirective,
        RxLet,
        FormDisabledDirective,
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

        @if (errorMsg()) {
            <div class="bg-error text-on-error mb-4 rounded-lg p-4">
                {{ errorMsg() }}
            </div>
        }

        <form
            [appFormDisabled]="loading()"
            [formGroup]="form"
            #formElement="ngForm"
            (ngSubmit)="onSubmit()"
            class="grid grid-cols-2 gap-3"
        >
            <mat-form-field>
                <mat-label>First name</mat-label>
                <input
                    matInput
                    id="firstName"
                    type="text"
                    [formControl]="form.controls.firstName"
                />
                <mat-hint>
                    @if (!form.controls.firstName.value) {
                        Enter your first name
                    }
                </mat-hint>
                <mat-error matTooltipEllipsis>
                    @if (form.controls.firstName.hasError('required')) {
                        First name is required
                    } @else if (form.controls.firstName.hasError('minlength')) {
                        First name must be at least 1 character long
                    } @else if (form.controls.firstName.hasError('maxlength')) {
                        Must be at most 30 characters long
                    } @else if (form.controls.firstName.hasError('letter')) {
                        Must contain at least one letter
                    } @else if (form.controls.firstName.hasError('name')) {
                        Can only contain letters, hyphens, and spaces
                    }
                </mat-error>
            </mat-form-field>

            <mat-form-field>
                <mat-label>Last name</mat-label>
                <input matInput id="lastName" type="text" [formControl]="form.controls.lastName" />
                <mat-hint>
                    @if (!form.controls.lastName.value) {
                        Enter your last name
                    }
                </mat-hint>
                <mat-error matTooltipEllipsis>
                    @if (form.controls.lastName.hasError('required')) {
                        Last name is required
                    } @else if (form.controls.lastName.hasError('minlength')) {
                        Must be at least 1 character long
                    } @else if (form.controls.lastName.hasError('maxlength')) {
                        Must be at most 30 characters long
                    } @else if (form.controls.lastName.hasError('letter')) {
                        Must contain at least one letter
                    } @else if (form.controls.lastName.hasError('name')) {
                        Can only contain letters, hyphens, and spaces
                    }
                </mat-error>
            </mat-form-field>

            <mat-form-field class="col-span-2">
                <mat-label>Email</mat-label>
                <input matInput id="email" type="text" [formControl]="form.controls.email" />
                <mat-hint>
                    @if (!form.controls.email.value) {
                        Enter your email address
                    }
                </mat-hint>
                <mat-error matTooltipEllipsis>
                    @if (form.controls.email.hasError('required')) {
                        Email is required
                    } @else if (form.controls.email.hasError('email')) {
                        Must be a valid email address
                    } @else if (form.controls.email.hasError('exists')) {
                        Email is already taken
                    }
                </mat-error>
            </mat-form-field>

            <mat-form-field class="col-span-2">
                <mat-label>Username</mat-label>
                <input matInput id="username" type="text" [formControl]="form.controls.username" />
                <mat-hint>
                    @if (!form.controls.username.value) {
                        Choose a username
                    }
                </mat-hint>
                <mat-error matTooltipEllipsis>
                    @if (form.controls.username.hasError('required')) {
                        Username is required
                    } @else if (form.controls.username.hasError('minlength')) {
                        Must be at least 3 characters long
                    } @else if (form.controls.username.hasError('maxlength')) {
                        Must be at most 20 characters long
                    } @else if (form.controls.username.hasError('pattern')) {
                        Can only contain letters, numbers, and underscores
                    } @else if (form.controls.username.hasError('exists')) {
                        Username is already taken
                    }
                </mat-error>
            </mat-form-field>

            <mat-form-field class="col-span-2" cdkOverlayOrigin #trigger="cdkOverlayOrigin">
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
                    [disabled]="loading()"
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
                        <mat-card-subtitle> Password must follow these rules </mat-card-subtitle>
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
                                <span [class.line-through]="!error"> At least 8 characters </span>
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

            <mat-form-field class="col-span-2">
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
                    [disabled]="loading()"
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
                type="submit"
                class="btn-primary col-span-2 mt-2"
                mat-flat-button
                [disabled]="form.invalid"
            >
                Sign up
            </button>
        </form>
    `,
    host: {
        class: 'h-fit grid w-full medium:w-96 large:w-[28rem] xlarge:w-[32rem]',
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageComponent {
    #fb = inject(NonNullableFormBuilder);
    #rpc = injectRpcClient();
    #router = inject(Router);
    #viewportRuler = inject(ViewportRuler);
    #accountService = inject(AccountService);

    isOpen = signal(false);
    triggerRect = signal<DOMRect | null>(null);
    overlayFocusable = signal(false);
    errorMsg = signal<string | null>(null);
    loading = signal(false);

    trigger = viewChild.required<CdkOverlayOrigin>('trigger');
    passwordInput = viewChild.required<HTMLElement>('passwordInput');
    overlay = viewChild.required<CdkConnectedOverlay>('overlay');
    formElement = viewChild.required<NgForm>('formElement');

    form = this.#fb.group(
        {
            firstName: [
                '',
                [
                    Validators.required,
                    Validators.minLength(1),
                    Validators.maxLength(30),
                    regexValidator(/[a-zA-Z]/, 'letter'),
                    regexValidator(/^[a-zA-Z]+[a-zA-Z-' ]*$/, 'name'),
                ],
            ],
            lastName: [
                '',
                [
                    Validators.required,
                    Validators.minLength(1),
                    Validators.maxLength(30),
                    regexValidator(/[a-zA-Z]/, 'letter'),
                    regexValidator(/^[a-zA-Z]+[a-zA-Z-' ]*$/, 'name'),
                ],
            ],
            email: ['', [Validators.required, Validators.email], [emailExistsValidator()]],
            username: [
                '',
                [
                    Validators.required,
                    Validators.minLength(3),
                    Validators.maxLength(20),
                    Validators.pattern(/^[a-zA-Z0-9_]+$/),
                ],
                [usernameExistsValidator()],
            ],
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
        const overlayElement = this.overlay().overlayRef.overlayElement;
        const target = ev.relatedTarget;

        if (
            !(target instanceof HTMLElement) ||
            (target !== overlayElement && !overlayElement.contains(target))
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

    displayErrorInOverlay(control: AbstractControl, error: string) {
        console.log(control.errors);
        return control.hasError(error) && (control.touched || this.formElement().submitted);
    }

    overlayErrors = toSignal(
        this.form.valueChanges.pipe(
            takeUntilDestroyed(),
            map(() => {
                return [
                    {
                        error:
                            this.form.controls.password.hasError('minlength') &&
                            (this.form.controls.password.touched || this.formElement().submitted),

                        message: 'At least 8 characters',
                    },
                ];
            }),
        ),
    );

    onSubmit() {
        if (!this.form.valid) {
            return;
        }

        this.#accountService
            .createAccount(
                this.form.controls.email.value,
                this.form.controls.username.value,
                this.form.controls.password.value,
                this.form.controls.firstName.value,
                this.form.controls.lastName.value,
            )
            .pipe(
                tap((res) => {
                    if (res.ok) {
                        this.errorMsg.set(null);
                    } else {
                        this.errorMsg.set(res.error);
                    }
                }),
                switchMap((res) =>
                    iif(
                        () => res.ok,
                        fromPromise(this.#router.navigate(['/registration-successful'])),
                        of(null),
                    ),
                ),
                deriveLoading(),
                tap((loading) => this.loading.set(loading)),
            )
            .subscribe();
    }
}
