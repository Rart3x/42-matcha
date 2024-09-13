import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SidesheetComponent } from '@app/shared/layouts/sidesheet-layout/sidesheet.component';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import { regexValidator } from '@app/shared/validators/regex.validator';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { injectUsernameAvailableValidator } from '@app/shared/validators/username-available.validator';
import { MatError, MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatTooltipEllipsisDirective } from '@app/shared/directives/mat-tooltip-ellipsis.directive';
import { RxLet } from '@rx-angular/template/let';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, first, tap } from 'rxjs';
import { SnackBarService } from '@app/core/services/snack-bar.service';

@Component({
    selector: 'app-edit-profile-sheet',
    standalone: true,
    imports: [
        SidesheetComponent,
        MatButton,
        MatProgressSpinner,
        MatError,
        MatTooltipEllipsisDirective,
        MatHint,
        ReactiveFormsModule,
        MatLabel,
        MatFormField,
        RxLet,
        MatOption,
        MatSelect,
        MatInput,
    ],
    template: `
        <app-sidesheet heading="Edit Profile" [loading]="profile.isPending()">
            <p class="mat-body-large">Update your profile information.</p>

            <form
                [formGroup]="form"
                (ngSubmit)="onSubmit()"
                id="profile-form"
                class="grid grid-cols-4 gap-2"
            >
                <mat-form-field *rxLet="form.controls.first_name as firstName" class="col-span-2">
                    <mat-label>First Name</mat-label>
                    <input
                        matInput
                        type="text"
                        placeholder="First Name"
                        [formControl]="form.controls.first_name"
                    />
                    <mat-hint matTooltipEllipsis>
                        @if (!form.controls.first_name.value) {
                            Enter your first name
                        }
                    </mat-hint>
                    <mat-error matTooltipEllipsis>
                        @if (form.controls.first_name.hasError('required')) {
                            First name is required
                        } @else if (firstName.hasError('minlength')) {
                            First name must be at least 1 character long
                        } @else if (firstName.hasError('maxlength')) {
                            Must be at most 30 characters long
                        } @else if (firstName.hasError('letter')) {
                            Must contain at least one letter
                        } @else if (firstName.hasError('name')) {
                            Can only contain letters, hyphens, and spaces
                        }
                    </mat-error>
                </mat-form-field>

                <mat-form-field *rxLet="form.controls.last_name as lastName" class="col-span-2">
                    <mat-label>Last Name</mat-label>
                    <input matInput type="test" placeholder="Last Name" [formControl]="lastName" />
                    <mat-hint matTooltipEllipsis>
                        @if (!lastName.value) {
                            Enter your last name.
                        }
                    </mat-hint>
                    <mat-error matTooltipEllipsis>
                        @if (lastName.hasError('required')) {
                            Last name is required
                        } @else if (lastName.hasError('minlength')) {
                            Must be at least 1 character long
                        } @else if (lastName.hasError('maxlength')) {
                            Must be at most 30 characters long
                        } @else if (lastName.hasError('letter')) {
                            Must contain at least one letter
                        } @else if (lastName.hasError('name')) {
                            Can only contain letters, hyphens, and spaces
                        }
                    </mat-error>
                </mat-form-field>

                <mat-form-field *rxLet="form.controls.username as username" class="col-span-3">
                    <mat-label>Username</mat-label>
                    <input matInput type="text" placeholder="Username" [formControl]="username" />
                    <mat-hint matTooltipEllipsis>
                        @if (!username.value) {
                            Choose a username.
                        }
                    </mat-hint>
                    <mat-error matTooltipEllipsis>
                        @if (username.hasError('required')) {
                            Username is required
                        } @else if (username.hasError('minlength')) {
                            Must be at least 3 characters long
                        } @else if (username.hasError('maxlength')) {
                            Must be at most 20 characters long
                        } @else if (username.hasError('pattern')) {
                            Can only contain letters, numbers, and underscores
                        } @else if (username.hasError('available')) {
                            Username is not available
                        }
                    </mat-error>
                </mat-form-field>

                <mat-form-field *rxLet="form.controls.age as age" class="col-span-1">
                    <mat-label>Age</mat-label>
                    <input matInput type="number" placeholder="Age" [formControl]="age" />
                    <mat-error matTooltipEllipsis>
                        @if (age.hasError('required')) {
                            Age is required
                        } @else if (age.hasError('min')) {
                            Must be at least 18 years old
                        } @else if (age.hasError('max')) {
                            Must be at most 130 years old
                        } @else if (age.hasError('pattern')) {
                            Must be a number
                        }
                    </mat-error>
                </mat-form-field>

                <mat-form-field *rxLet="form.controls.gender as gender" class="col-span-2">
                    <mat-label>Gender</mat-label>
                    <mat-select [formControl]="gender">
                        <mat-option value="male">Male</mat-option>
                        <mat-option value="female">Female</mat-option>
                        <mat-option value="other">Other</mat-option>
                    </mat-select>
                    <mat-error matTooltipEllipsis>
                        @if (!gender.hasError('required')) {
                            Gender is required
                        } @else if (gender.hasError('pattern')) {
                            Gender must be 'male, female, or other'
                        }
                    </mat-error>
                </mat-form-field>

                <mat-form-field
                    *rxLet="form.controls.sexual_pref as sexualPreferences"
                    class="col-span-2"
                >
                    <mat-label>Sexual preferences</mat-label>
                    <mat-select [formControl]="form.controls.sexual_pref">
                        <mat-option value="female">Female</mat-option>
                        <mat-option value="male">Male</mat-option>
                        <mat-option value="any">any</mat-option>
                    </mat-select>
                    <mat-error matTooltipEllipsis>
                        @if (!sexualPreferences.hasError('required')) {
                            Sexual preferences is required
                        } @else if (sexualPreferences.hasError('pattern')) {
                            Sexual preferences must
                        }
                    </mat-error>
                </mat-form-field>

                <mat-form-field *rxLet="form.controls.biography as bio" class="col-span-4">
                    <mat-label>Bio</mat-label>
                    <textarea
                        matInput
                        type="text"
                        placeholder="Bio"
                        [formControl]="form.controls.biography"
                    ></textarea>
                    <mat-hint matTooltipEllipsis>
                        @if (!bio.value) {
                            Please enter your bio.
                        }
                    </mat-hint>
                    <mat-error matTooltipEllipsis>
                        @if (bio.hasError('required')) {
                            Bio is required
                        } @else if (bio.hasError('minlength')) {
                            Must be at least 1 character long
                        } @else if (bio.hasError('maxlength')) {
                            Must be at most 500 characters long
                        } @else if (bio.hasError('bio')) {
                            Can only contain letters, numbers, hyphens, and spaces
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
export class EditProfileSheetComponent {
    #fb = inject(NonNullableFormBuilder);
    #rpcClient = injectRpcClient();
    #snackbar = inject(SnackBarService);
    #usernameAvailableValidator = injectUsernameAvailableValidator();

    form = this.#fb.group({
        first_name: [
            '',
            [
                Validators.required,
                Validators.minLength(1),
                Validators.maxLength(30),
                regexValidator(/[a-zA-Z]/, 'letter'),
                regexValidator(/^[a-zA-Z]+[a-zA-Z-' ]*$/, 'name'),
            ],
        ],
        last_name: [
            '',
            [
                Validators.required,
                Validators.minLength(1),
                Validators.maxLength(30),
                regexValidator(/[a-zA-Z]/, 'letter'),
                regexValidator(/^[a-zA-Z]+[a-zA-Z-' ]*$/, 'name'),
            ],
        ],
        username: [
            '',
            [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(20),
                Validators.pattern(/^[a-zA-Z0-9_]+$/),
            ],
            [this.#usernameAvailableValidator],
        ],
        age: [
            '',
            [
                Validators.required,
                Validators.min(18),
                Validators.max(130),
                Validators.pattern(/^[0-9]+$/),
            ],
        ],
        biography: [
            '',
            [
                Validators.required,
                Validators.minLength(1),
                Validators.maxLength(500),
                regexValidator(/^[a-zA-Z0-9]+[a-zA-Z0-9-' ]*$/, 'bio'),
            ],
        ],
        sexual_pref: [
            'any' as 'male' | 'female' | 'any',
            [Validators.required, Validators.pattern(/^(male|female|any)$/)],
        ],
        gender: [
            'other' as 'male' | 'female' | 'other',
            [Validators.required, Validators.pattern(/^(male|female|other)$/)],
        ],
    });

    profile = injectQuery(() => ({
        queryKey: ['profile'],
        queryFn: () => this.#rpcClient.getPrincipalProfile(),
    }));

    update = injectMutation(() => ({
        mutationFn: this.#rpcClient.patchPrincipalProfile,
        onSuccess: () => {
            this.#snackbar.enqueueSnackBar('Profile updated');
        },
        onError: () => {
            this.#snackbar.enqueueSnackBar('Failed to update profile');
        },
    }));

    #initialValues = toSignal(
        toObservable(this.profile.data).pipe(
            filter((data) => !!data),
            first(),
            tap((data) => this.form.patchValue(data)),
        ),
    );

    onSubmit() {
        if (this.form.valid) {
            this.update.mutate(this.form.getRawValue());
        }
    }

    onReset() {
        const data = this.#initialValues();
        if (data) {
            this.form.patchValue(data);
        }
    }
}
