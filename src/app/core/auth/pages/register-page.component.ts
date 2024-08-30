import {
    ChangeDetectionStrategy,
    Component,
    inject,
    signal,
    viewChild,
} from '@angular/core';
import { AuthLayoutComponent } from '@app/core/auth/layouts/auth-layout.component';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import {
    NonNullableFormBuilder,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import {
    MAT_FORM_FIELD_DEFAULT_OPTIONS,
    MatFormFieldModule,
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPasswordToggleButtonComponent } from '@app/shared/components/mat-password-toggle-button/mat-password-toggle-button.component';
import {
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    ViewportRuler,
} from '@angular/cdk/overlay';
import {
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
} from '@angular/material/card';
import { rxEffect } from 'ngxtension/rx-effect';
import { debounceTime, filter } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { regexValidator } from '@app/shared/validators/regex.validator';
import { MatTooltipEllipsisDirective } from '@app/shared/directives/mat-tooltip-ellipsis.directive';

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
                <mat-hint>
                    @if (!registerForm.controls.firstName.value) {
                        Enter your first name
                    }
                </mat-hint>
                <mat-error class="!line-clamp-1">
                    <span matTooltipEllipsis>
                        @if (
                            registerForm.controls.firstName.hasError('required')
                        ) {
                            First name is required
                        } @else if (
                            registerForm.controls.firstName.hasError(
                                'minlength'
                            )
                        ) {
                            First name must be at least 1 character long
                        } @else if (
                            registerForm.controls.firstName.hasError(
                                'maxlength'
                            )
                        ) {
                            Must be at most 30 characters long
                        } @else if (
                            registerForm.controls.firstName.hasError('letter')
                        ) {
                            Must contain at least one letter
                        } @else if (
                            registerForm.controls.firstName.hasError('name')
                        ) {
                            Can only contain letters, hyphens, and spaces
                        }
                    </span>
                </mat-error>
            </mat-form-field>

            <mat-form-field>
                <mat-label>Last name</mat-label>
                <input
                    matInput
                    type="text"
                    [formControl]="registerForm.controls.lastName"
                />
                <mat-hint>
                    @if (!registerForm.controls.lastName.value) {
                        Enter your last name
                    }
                </mat-hint>
                <mat-error>
                    @if (registerForm.controls.lastName.hasError('required')) {
                        Last name is required
                    } @else if (
                        registerForm.controls.lastName.hasError('minlength')
                    ) {
                        Must be at least 1 character long
                    } @else if (
                        registerForm.controls.lastName.hasError('maxlength')
                    ) {
                        Must be at most 30 characters long
                    } @else if (
                        registerForm.controls.lastName.hasError('letter')
                    ) {
                        Must contain at least one letter
                    } @else if (
                        registerForm.controls.lastName.hasError('name')
                    ) {
                        Can only contain letters, hyphens, and spaces
                    }
                </mat-error>
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

            <mat-form-field
                class="col-span-2"
                cdkOverlayOrigin
                #trigger="cdkOverlayOrigin"
            >
                <mat-label>Password</mat-label>
                <input
                    matInput
                    type="password"
                    [formControl]="registerForm.controls.password"
                    #passwordInput
                    (focus)="openOverlay()"
                    (input)="openOverlay()"
                    (blur)="closeOverlay()"
                />
                <mat-password-toggle-button
                    matSuffix
                    [inputElement]="passwordInput"
                />
                @if (!registerForm.controls.password.value) {
                    <mat-hint>Choose a strong password</mat-hint>
                }
            </mat-form-field>

            <ng-template
                cdkConnectedOverlay
                [cdkConnectedOverlayWidth]="triggerRect()?.width || 0"
                [cdkConnectedOverlayOrigin]="trigger"
                [cdkConnectedOverlayOpen]="isOpen()"
            >
                <mat-card class="-mt-4 mb-2 w-full bg-white">
                    <mat-card-header>
                        <mat-card-subtitle>
                            Password must follow these rules
                        </mat-card-subtitle>
                    </mat-card-header>
                    <mat-card-content>
                        <!-- Password rules -->
                        <!-- list with ruler matched indicators -->
                        <ul class="grid gap-1">
                            <li class="flex items-center">
                                @if (
                                    !registerForm.controls.password.value
                                        .length ||
                                    registerForm.controls.password.hasError(
                                        'uppercase'
                                    )
                                ) {
                                    <mat-icon>close</mat-icon>
                                } @else {
                                    <mat-icon>done</mat-icon>
                                }
                                At least 8 characters
                            </li>
                            <li class="flex items-center">
                                @if (
                                    !registerForm.controls.password.value
                                        .length ||
                                    registerForm.controls.password.hasError(
                                        'uppercase'
                                    )
                                ) {
                                    <mat-icon>close</mat-icon>
                                } @else {
                                    <mat-icon>done</mat-icon>
                                }
                                At least 1 uppercase letter
                            </li>
                            <li class="flex items-center">
                                <mat-icon>done</mat-icon>
                                At least 1 lowercase letter
                            </li>
                            <li class="flex items-center">
                                <mat-icon>done</mat-icon>
                                At least 1 number
                            </li>
                            <li class="flex items-center">
                                <mat-icon>done</mat-icon>
                                At least 1 special character
                            </li>
                        </ul>
                    </mat-card-content>
                </mat-card>
            </ng-template>

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
    host: {
        class: 'h-fit grid w-full medium:w-96 large:w-[28rem] xlarge:w-[32rem]',
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageComponent {
    #fb = inject(NonNullableFormBuilder);
    #viewportRuler = inject(ViewportRuler);

    registerForm = this.#fb.group({
        email: ['', [Validators.required, Validators.email]],
        username: [
            '',
            [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(20),
                Validators.pattern(/^[a-zA-Z0-9_]+$/),
            ],
        ],
        password: [
            '',
            [
                Validators.required,
                Validators.minLength(8),
                Validators.maxLength(30),
                regexValidator(/[a-z]/, 'lowercase'),
                regexValidator(/[A-Z]/, 'uppercase'),
                regexValidator(/[0-9]/, 'number'),
                regexValidator(/[^a-zA-Z0-9]/, 'special'),
            ],
        ],
        confirmPassword: ['', [Validators.required]],
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
    });

    isOpen = signal(false);
    triggerRect = signal<DOMRect | null>(null);
    trigger = viewChild.required<CdkOverlayOrigin>('trigger');

    #resizeOverlay() {
        this.triggerRect.set(
            this.trigger().elementRef.nativeElement.getBoundingClientRect(),
        );
    }

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

    closeOverlay() {
        this.isOpen.set(false);
    }
}
