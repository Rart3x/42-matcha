import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
    host: { class: 'grid grid-rows-[auto_1fr] overflow-hidden absolute inset-0' },
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
            class="relative mb-2 flex gap-8 overflow-hidden medium:mr-3 expanded:mr-6 expanded:rounded-tl-2xl"
        >
            <!-- Conversation list -->
            <app-conversation-list class="w-full expanded:w-[20rem] large:w-[26rem]" />

            <!-- Placeholder for when no conversation is selected -->
            @if (!outletActivated()) {
                <div class="grid grow place-content-center max-expanded:hidden">
                    <div class="flex flex-col items-center justify-center gap-4">
                        <mat-icon>chat</mat-icon>
                        <p class="text-center">Select a conversation to start chatting</p>
                    </div>
                </div>
            }

            <!-- Conversation page outlet -->
            <div
                [ngClass]="[
                    'absolute inset-0',
                    'bg-surface-container max-medium:px-2 max-expanded:pt-2',
                    'expanded:static expanded:flex-grow',
                    outletActivated() ? '' : 'hidden',
                ]"
            >
                <router-outlet
                    (activate)="outletActivated.set(true)"
                    (deactivate)="outletActivated.set(false)"
                />
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

    // hack to make isActivated outlet property reactive
    outletActivated = signal(false);

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
