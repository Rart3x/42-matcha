import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatAnchor } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { RouterLink } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { SnackBarService } from '@app/core/services/snack-bar.service';
import { EmailRoutedLayoutComponent } from '@app/shared/layouts/email-routed-layout/email-routed-layout.component';
import { AlertComponent } from '@app/shared/components/alert/alert.component';

@Component({
    selector: 'app-confirm-email-modification-page',
    standalone: true,
    imports: [
        MatIcon,
        MatProgressSpinner,
        RouterLink,
        MatAnchor,
        EmailRoutedLayoutComponent,
        AlertComponent,
    ],
    template: `
        <app-email-routed-layout title="Confirm Email" icon="email">
            @if (confirm.isPending()) {
                <mat-spinner diameter="45" class="mb-8 self-center" />
                <p class="self-center text-balance text-lg">Confirming your email address...</p>
            }
            @if (failed()) {
                <app-alert>
                    <ng-container heading>Confirmation failed</ng-container>
                    Invalid link.
                </app-alert>
                <a
                    mat-stroked-button
                    routerLink="/login"
                    [state]="{ username: username() }"
                    class="mt-4 rounded-md bg-primary px-4 py-2 text-white"
                >
                    Back to login
                </a>
            }
            @if (confirmed()) {
                <p class="text-balance text-lg">Your email address has been confirmed.</p>
                <a
                    mat-stroked-button
                    routerLink="/login"
                    [state]="{ username: username() }"
                    class="mt-4 rounded-md bg-primary px-4 py-2 text-white"
                >
                    Back to login
                </a>
            }
        </app-email-routed-layout>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmEmailModificationPageComponent {
    #rpc = injectRpcClient();
    #snackbar = inject(SnackBarService);

    confirm = injectQuery(() => ({
        queryKey: ['confirmEmailModification', this.token()],
        queryFn: ({ queryKey }) => this.#rpc.confirmEmailModification({ token: queryKey[1] }),
        onSuccess: () => {
            this.#snackbar.enqueueSnackBar('Your email address has been confirmed.');
        },
        onError: () => {
            this.#snackbar.enqueueSnackBar('Failed to confirm email address.');
        },
    }));

    confirmed = computed(() => this.confirm.isSuccess());
    failed = computed(() => this.confirm.isError());

    token = input.required<string>();

    username = computed(() => this.confirm.data()?.username);
}
