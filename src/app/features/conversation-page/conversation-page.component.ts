import {
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    input,
    signal,
    viewChild,
} from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatError, MatFormField, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconAnchor, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import {
    injectInfiniteQuery,
    injectMutation,
    injectQuery,
    injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { FormsModule } from '@angular/forms';
import { CdkScrollable, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { DatePipe, NgClass } from '@angular/common';

@Component({
    selector: 'app-conversation-page',
    standalone: true,
    imports: [
        MatCard,
        MatCardContent,
        MatFormField,
        MatInput,
        MatHint,
        MatLabel,
        MatError,
        MatIconButton,
        MatSuffix,
        MatIcon,
        MatTooltip,
        MatIconAnchor,
        RouterLink,
        FormsModule,
        CdkVirtualScrollViewport,
        DatePipe,
        CdkScrollable,
        MatButton,
        NgClass,
    ],
    host: { class: 'flex h-full relative flex-col gap-1 overflow-hidden' },
    template: `
        <mat-card appearance="outlined">
            <mat-card-content>
                <div class="flex gap-2">
                    <a mat-icon-button matTooltip="back" routerLink="/chat">
                        <mat-icon>arrow_back</mat-icon>
                    </a>
                    <h2 class="mat-display-small !mb-0">
                        {{ onlineStatusQuery.data()?.username }}
                    </h2>
                    <small class="flex items-end">
                        @if (onlineStatusQuery.data()?.online) {
                            online
                        } @else {
                            last seen {{ onlineStatusQuery.data()?.last_seen }}
                        }
                    </small>
                </div>
            </mat-card-content>
        </mat-card>

        <div class="flex grow flex-col-reverse overflow-y-auto" cdkScrollable>
            @for (message of messages(); track message.id) {
                <div class="flex flex-col gap-1 p-2">
                    @if (message.receiver_id === other_user_id_number()) {
                        <!-- Sent message (right) -->
                        <div class="flex justify-end">
                            <div class="flex flex-col items-end gap-0.5">
                                <small class="block text-right text-xs"> You </small>
                                <div
                                    [ngClass]="[
                                        'px-4 py-2',
                                        'rounded-3xl rounded-br-md',
                                        'bg-primary-container text-on-primary-container',
                                    ]"
                                >
                                    {{ message.message }}
                                </div>
                                <small class="block text-right text-xs">
                                    {{ message.created_at | date: 'short' }}
                                </small>
                            </div>
                        </div>
                    } @else {
                        <!-- Received message (left) -->
                        <div class="flex gap-2">
                            <div class="flex flex-col items-start gap-0.5">
                                <small class="block text-xs">{{ message.sender_username }} </small>
                                <div
                                    [ngClass]="[
                                        'px-4 py-2',
                                        'rounded-3xl rounded-bl-md',
                                        'bg-secondary-container text-on-secondary-container',
                                    ]"
                                >
                                    {{ message.message }}
                                </div>
                                <small class="block text-xs">
                                    {{ message.created_at | date: 'short' }}
                                </small>
                            </div>
                        </div>
                    }
                </div>
            }

            @if (messagesQuery.hasNextPage()) {
                <div class="flex justify-center p-2">
                    <button
                        mat-button
                        [disabled]="messagesQuery.isFetchingNextPage()"
                        (click)="messagesQuery.fetchNextPage()"
                    >
                        Load more
                    </button>
                </div>
            }
        </div>

        <mat-card appearance="outlined">
            <mat-card-content>
                <form (ngSubmit)="onMessageSubmit()">
                    <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Message</mat-label>
                        <input
                            name="message"
                            matInput
                            placeholder="Type a message"
                            [(ngModel)]="message"
                            [readonly]="postMessage.isPending()"
                            autocomplete="off"
                            [maxlength]="255"
                            #messageInput
                        />
                        <button
                            type="submit"
                            mat-icon-button
                            matSuffix
                            class="mr-2"
                            matTooltip="send"
                            [disabled]="!message() || postMessage.isPending()"
                        >
                            <mat-icon>send</mat-icon>
                        </button>

                        <mat-hint>Press Enter to send</mat-hint>
                        <mat-hint align="end">{{ message().length }}/255</mat-hint>
                    </mat-form-field>
                </form>
            </mat-card-content>
        </mat-card>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationPageComponent {
    #PAGE_SIZE = 10;

    #rpcClient = injectRpcClient();
    #queryClient = injectQueryClient();

    other_user_id = input.required<string>();
    other_user_id_number = computed(() => Number.parseInt(this.other_user_id(), 10));

    message = signal('');
    messageInput = viewChild<ElementRef<HTMLInputElement>>('messageInput');

    messagesQuery = injectInfiniteQuery(() => ({
        queryKey: ['messages', this.other_user_id_number()] as const,
        queryFn: ({ pageParam, queryKey }) =>
            this.#rpcClient.getMessagesByUserId({
                other_user_id: queryKey[1],
                offset: pageParam * this.#PAGE_SIZE,
                limit: this.#PAGE_SIZE,
            }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (lastPage.messages.length < this.#PAGE_SIZE) {
                return undefined;
            }
            return lastPageParam + 1;
        },
        // poll new messages every second
        refetchInterval: 1000,
    }));

    messages = computed(
        () => this.messagesQuery.data()?.pages.flatMap((page) => page.messages) ?? [],
    );

    onlineStatusQuery = injectQuery(() => ({
        queryKey: ['online-status', this.other_user_id_number()] as const,
        queryFn: ({ queryKey }) => this.#rpcClient.getOnlineStatusById({ user_id: queryKey[1] }),
        refetchInterval: /* 30sec */ 30_000,
    }));

    postMessage = injectMutation(() => ({
        mutationKey: ['postMessage'],
        mutationFn: this.#rpcClient.postMessage,
        onSuccess: async () => {
            await this.#queryClient.invalidateQueries({ queryKey: ['conversations'] });
            await this.#queryClient.invalidateQueries({
                queryKey: ['messages', this.other_user_id_number()],
            });
            this.message.set('');
            this.messageInput()?.nativeElement.focus();
        },
    }));

    onMessageSubmit() {
        const message = this.message();
        if (message) {
            this.postMessage.mutate({ receiver_id: this.other_user_id_number(), message });
        }
    }
}
