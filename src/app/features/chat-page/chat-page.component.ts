import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { injectMutation, injectQueryClient } from '@tanstack/angular-query-experimental';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { SnackBarService } from '@app/core/services/snack-bar.service';
import { Router, RouterOutlet } from '@angular/router';
import { ConversationListComponent } from '@app/features/chat-page/conversation-list/conversation-list.component';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-chat-page',
    standalone: true,
    imports: [
        MatIcon,
        MatToolbarRow,
        MatToolbar,
        MatIconButton,
        MatTooltip,
        ConversationListComponent,
        RouterOutlet,
        NgClass,
    ],
    host: { class: 'flex min-h-full relative flex-col gap-1' },
    template: `
        <mat-toolbar class="!bg-transparent">
            <mat-toolbar-row class="!pt-2">
                <h1 class="mat-display-small !mb-0">Chat</h1>
                <span class="grow"></span>
                <button mat-icon-button matTooltip="notifications">
                    <mat-icon>notifications</mat-icon>
                </button>

                <button mat-icon-button matTooltip="logout" (click)="logout.mutate()">
                    <mat-icon>logout</mat-icon>
                </button>
            </mat-toolbar-row>
        </mat-toolbar>

        <div
            class="relative flex grow gap-8 overflow-hidden rounded-tl-2xl pb-2 pr-3 expanded:pr-6"
        >
            <app-conversation-list class="w-full expanded:w-[26rem]" />

            @if (!outlet.isActivated) {
                <div class="grid grow place-content-center max-medium:hidden">
                    <div class="flex flex-col items-center justify-center gap-4">
                        <mat-icon>chat</mat-icon>
                        <p class="text-center">Select a conversation to start chatting</p>
                    </div>
                </div>
            }
            <div
                [ngClass]="[
                    'absolute inset-0',
                    'bg-surface-container expanded:static expanded:flex-grow',
                    outlet.isActivated ? '' : 'hidden',
                ]"
            >
                <router-outlet #outlet="outlet" />
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatPageComponent {
    #router = inject(Router);
    #queryClient = injectQueryClient();
    #snackBar = inject(SnackBarService);
    #rpcClient = injectRpcClient();

    logout = injectMutation(() => ({
        mutationFn: this.#rpcClient.logout,
        onSuccess: async () => {
            this.#snackBar.enqueueSnackBar('You have been logged out');
            await this.#queryClient.invalidateQueries({ queryKey: ['verifySession'] });
            await this.#router.navigate(['/login']);
        },
        onError: () => {
            this.#snackBar.enqueueSnackBar('Failed to logout');
        },
    }));
}
