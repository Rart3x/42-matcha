import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatError, MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatOption, MatSelect } from '@angular/material/select';
import { RxLet } from '@rx-angular/template/let';
import { MatTooltipEllipsisDirective } from '@app/shared/directives/mat-tooltip-ellipsis.directive';
import { regexValidator } from '@app/shared/validators/regex.validator';
import { usernameExistsValidator } from '@app/shared/validators/username-exists.validator';

@Component({
    selector: 'app-edit-profile-form',
    standalone: true,
    imports: [
        MatFormField,
        MatInput,
        ReactiveFormsModule,
        MatSelect,
        MatOption,
        MatLabel,
        MatHint,
        MatError,
        RxLet,
        MatTooltipEllipsisDirective,
    ],
    template: `
        <form [formGroup]="form" id="profile-form" class="grid grid-cols-4 gap-2">
            <mat-form-field *rxLet="form.controls.firstName as firstName" class="col-span-2">
                <mat-label>First Name</mat-label>
                <input matInput type="text" placeholder="First Name" [formControl]="firstName" />
                <mat-hint matTooltipEllipsis>
                    @if (!firstName.value) {
                        Enter your first name
                    }
                </mat-hint>
                <mat-error matTooltipEllipsis>
                    @if (firstName.hasError('required')) {
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

            <mat-form-field *rxLet="form.controls.lastName as lastName" class="col-span-2">
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
                    } @else if (username.hasError('usernameExists')) {
                        Username is already taken
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
                *rxLet="form.controls.sexualPreferences as sexualPreferences"
                class="col-span-2"
            >
                <mat-label>Sexual preferences</mat-label>
                <mat-select [formControl]="form.controls.sexualPreferences">
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

            <mat-form-field *rxLet="form.controls.bio as bio" class="col-span-4">
                <mat-label>Bio</mat-label>
                <textarea
                    matInput
                    type="text"
                    placeholder="Bio"
                    [formControl]="form.controls.bio"
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
    `,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditProfileFormComponent {
    #fb = inject(NonNullableFormBuilder);

    defaultValues = input<{
        firstName: string;
        lastName: string;
        username: string;
        age: number;
        bio: string;
        sexual: string;
    }>();

    form = this.#fb.group({
        firstName: [
            this.defaultValues().firstName || '',
            Validators.required,
            Validators.minLength(1),
            Validators.maxLength(30),
            regexValidator(/[a-zA-Z]/, 'letter'),
            regexValidator(/^[a-zA-Z]+[a-zA-Z-' ]*$/, 'name'),
        ],
        lastName: [
            '',
            Validators.required,
            Validators.minLength(1),
            Validators.maxLength(30),
            regexValidator(/[a-zA-Z]/, 'letter'),
            regexValidator(/^[a-zA-Z]+[a-zA-Z-' ]*$/, 'name'),
        ],
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
        age: [
            0,
            [
                Validators.required,
                Validators.min(18),
                Validators.max(130),
                Validators.pattern(/^[0-9]+$/),
            ],
        ],
        bio: [
            '',
            [
                Validators.required,
                Validators.minLength(1),
                Validators.maxLength(500),
                regexValidator(/^[a-zA-Z0-9]+[a-zA-Z0-9-' ]*$/, 'bio'),
            ],
        ],
        sexualPreferences: [
            'any',
            [Validators.required, Validators.pattern(/^(male|female|any)$/)],
        ],
        gender: ['other', [Validators.required, Validators.pattern(/^(male|female|other)$/)]],
    });
}
