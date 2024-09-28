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
import { MatIconAnchor, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import {
    injectInfiniteQuery,
    injectMutation,
    injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { injectRpcClient } from '@app/core/http/rpc-client';
import { FormsModule } from '@angular/forms';
import { CdkScrollable, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { DatePipe } from '@angular/common';

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
    ],
    host: { class: 'flex h-full relative flex-col gap-1 overflow-hidden' },
    template: `
        <mat-card appearance="outlined">
            <mat-card-content>
                <div class="flex gap-2">
                    <a mat-icon-button matTooltip="back" routerLink="/chat">
                        <mat-icon>arrow_back</mat-icon>
                    </a>
                    <h2 class="mat-display-small !mb-0">Conversation</h2>
                </div>
            </mat-card-content>
        </mat-card>

        <div class="flex grow flex-col-reverse overflow-y-auto" cdkScrollable>
            @for (message of messages(); track message.id) {
                <div class="flex flex-col gap-1 p-2">
                    @if (message.receiver_id === other_user_id_number()) {
                        <div class="flex justify-end gap-2">
                            <div class="flex flex-col items-end">
                                <p class="text-on-primary-variant rounded-lg bg-primary p-2">
                                    {{ message.message }}
                                </p>
                                <small class="text-right text-xs">
                                    {{ message.created_at | date: 'short' }}
                                </small>
                            </div>
                        </div>
                    } @else {
                        <div class="flex gap-2">
                            <div class="flex flex-col items-start">
                                <p class="bg-secondary text-on-secondary-variant rounded-lg p-2">
                                    {{ message.message }}
                                </p>
                                <small class="text-xs">
                                    {{ message.created_at | date: 'short' }}
                                </small>
                            </div>
                        </div>
                    }
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
                    </mat-form-field>
                </form>
            </mat-card-content>
        </mat-card>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationPageComponent {
    #rpcClient = injectRpcClient();
    #queryClient = injectQueryClient();

    #PAGE_SIZE = 10;

    other_user_id = input.required<string>();
    other_user_id_number = computed(() => Number.parseInt(this.other_user_id(), 10));

    message = signal('');

    messageInput = viewChild<ElementRef<HTMLInputElement>>('messageInput');

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
            if (lastPage.messages.length === 0) {
                return undefined;
            }
            return lastPageParam + 1;
        },
    }));

    messages = computed(
        () => this.messagesQuery.data()?.pages.flatMap((page) => page.messages) ?? [],
    );

    onMessageSubmit() {
        const message = this.message();
        if (message) {
            this.postMessage.mutate({ receiver_id: this.other_user_id_number(), message });
        }
    }
}
