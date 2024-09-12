import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatAnchor } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { RouterLink } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { SnackBarService } from '@app/core/services/snack-bar.service';

@Component({
    selector: 'app-confirm-email-page',
    standalone: true,
    imports: [MatIcon, MatProgressSpinner, RouterLink, MatAnchor],
    template: `
        <div class="grid grow place-content-center rounded-t-xlarge bg-surface p-4 text-on-surface">
            <div class="flex flex-col items-center">
                <mat-icon class="!h-fit !w-fit text-center text-6xl">email</mat-icon>
                <h3 class="pb-8 text-4xl font-bold">Confirm your email</h3>

                <div class="flex h-48 w-96 flex-col items-center">
                    @if (confirm.isPending()) {
                        <mat-spinner diameter="45" class="mb-8"></mat-spinner>
                        <p class="text-balance text-lg">Confirming your email address...</p>
                    } @else {
                        <p class="text-balance text-lg">Confirmation failed. Invalid link.</p>
                        <a
                            mat-stroked-button
                            routerLink="/login"
                            [state]="{ username: username() }"
                            class="bg-primary mt-4 rounded-md px-4 py-2 text-white"
                        >
                            Continue
                        </a>
                    }
                </div>
            </div>
        </div>
    `,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        role: 'main',
        class: 'min-w-screen relative flex flex-col  min-h-screen gap-6 overflow-auto p-4 pb-0 medium:p-6 medium:pb-0 bg-surface-container',
    },
})
export class ConfirmEmailPageComponent {
    #rpc = injectRpcClient();
    #snackbar = inject(SnackBarService);

    confirm = injectQuery(() => ({
        queryKey: ['confirmEmail', this.token()],
        queryFn: ({ queryKey }) => this.#rpc.confirmEmail({ token: queryKey[1] }),
        onSuccess: () => {
            this.#snackbar.enqueueSnackBar('Your email address has been confirmed.');
        },
        onError: () => {
            this.#snackbar.enqueueSnackBar('Failed to confirm email address.');
        },
    }));

    token = input.required<string>();

    username = computed(() => this.confirm.data()?.username);
}
