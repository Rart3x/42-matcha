import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { MatAnchor } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { tap } from 'rxjs';
import { LoggerService } from '@app/core/services/logger.service';
import { deriveLoading } from 'ngxtension/derive-loading';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-confirm-email-page',
    standalone: true,
    imports: [MatIcon, MatProgressSpinner, RouterLink, MatAnchor],
    template: `
        <div class="bg-surface text-on-surface grid grow place-content-center rounded-t-xlarge p-4">
            <div class="flex flex-col items-center">
                <mat-icon class="!h-fit !w-fit text-center text-6xl">email</mat-icon>
                <h3 class="pb-8 text-4xl font-bold">Confirm your email</h3>

                <div class="flex h-48 w-96 flex-col items-center">
                    @if (loading()) {
                        <mat-spinner diameter="45" class="mb-8"></mat-spinner>
                        <p class="text-balance text-lg">Confirming your email address...</p>
                    } @else {
                        <p class="text-balance text-lg">{{ message() }}</p>
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
export class ConfirmEmailPageComponent implements OnInit {
    #rpc = injectRpcClient();
    #logger = inject(LoggerService);

    token = input.required<string>();

    message = signal('');
    loading = signal(false);
    username = signal(''); // autofill login form with username after email confirmation

    ngOnInit() {
        this.#rpc
            .confirmEmail({ token: this.token() })
            .pipe(
                tap((res) => {
                    if (res.ok) {
                        this.#logger.info('Email confirmed');
                    } else {
                        this.#logger.error(res.error);
                    }
                }),
                tap((res) => {
                    if (res.ok) {
                        this.username.set(res.data.username);
                        this.message.set('Your email address has been confirmed.');
                    } else {
                        this.message.set(res.error);
                    }
                }),
                deriveLoading(),
                tap((loading) => this.loading.set(loading)),
            )
            .subscribe();
    }
}
