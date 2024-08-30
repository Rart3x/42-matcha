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
        email: [''],
        username: [''],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: [''],
        firstName: [''],
        lastName: [''],
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
