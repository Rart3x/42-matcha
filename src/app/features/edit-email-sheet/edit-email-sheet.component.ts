import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SidesheetComponent } from '@app/shared/layouts/sidesheet-layout/sidesheet.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatError, MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTooltipEllipsisDirective } from '@app/shared/directives/mat-tooltip-ellipsis.directive';
import { RxLet } from '@rx-angular/template/let';
import { MatIcon } from '@angular/material/icon';
import { SnackBarService } from '@app/core/services/snack-bar.service';
import { injectRpcClient } from '@app/core/http/rpc-client';
import {
    injectMutation,
    injectQuery,
    injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { injectEmailAvailableValidator } from '@app/shared/validators/email-available.validator';
import { MatButton } from '@angular/material/button';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { filter, first, tap } from 'rxjs';

@Component({
    selector: 'app-edit-email-sheet',
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
        RxLet,
        MatIcon,
        MatButton,
    ],
    template: `
        <app-sidesheet heading="Edit Email" [loading]="false">
            <p class="mat-body-large">Update your email address</p>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" id="profile-form" class="grid gap-2">
                <mat-form-field>
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
                        } @else if (form.controls.email.hasError('available')) {
                            Email is already taken
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
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditEmailSheetComponent {
    #fb = inject(FormBuilder);
    #snackbar = inject(SnackBarService);
    #rpcClient = injectRpcClient();
    #queryClient = injectQueryClient();

    email = injectQuery(() => ({
        queryKey: ['email'],
        queryFn: () => this.#rpcClient.getEmail(),
    }));

    #initialValues = toSignal(
        toObservable(this.email.data).pipe(
            filter((data) => !!data),
            first(),
            tap((data) => this.form.patchValue(data)),
        ),
    );

    update = injectMutation(() => ({
        mutationKey: ['updateSettings'],
        mutationFn: this.#rpcClient.updateEmail,
        onSuccess: async () => {
            this.#snackbar.enqueueSnackBar('Email updated successfully');
            await this.#queryClient.invalidateQueries({ queryKey: ['email'] });
        },
        onError: async () => {
            this.#snackbar.enqueueSnackBar('Failed to update email');
        },
    }));

    form = this.#fb.group({
        email: ['', [Validators.required, Validators.email], [injectEmailAvailableValidator()]],
    });

    onSubmit() {
        if (this.form.valid) {
            this.update.mutate(this.form.getRawValue() as { email: string });
        }
    }

    onReset() {
        const data = this.#initialValues();
        if (data) {
            this.form.patchValue(data);
        }
    }
}
