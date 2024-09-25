import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import {
    MatList,
    MatListItem,
    MatListItemAvatar,
    MatListItemLine,
    MatListItemMeta,
    MatListItemTitle,
    MatNavList,
} from '@angular/material/list';
import { injectInfiniteQuery } from '@tanstack/angular-query-experimental';
import { injectRpcClient } from '@app/core/http/rpc-client';
import {
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    CdkVirtualScrollableElement,
    CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
    selector: 'app-conversation-list',
    standalone: true,
    imports: [
        MatList,
        MatListItem,
        MatNavList,
        CdkVirtualForOf,
        MatListItemAvatar,
        MatListItemTitle,
        MatListItemMeta,
        MatListItemLine,
        DatePipe,
        CdkVirtualScrollViewport,
        CdkFixedSizeVirtualScroll,
        CdkVirtualScrollableElement,
        MatIcon,
        MatProgressSpinner,
        MatButton,
        FormsModule,
        MatIconButton,
    ],
    host: { class: 'grid place-content-stretch' },
    template: `
        <div cdkVirtualScrollingElement class="pr-2 max-medium:!pl-2">
            <label
                class="focus-within:border-primary group mb-2 flex items-center rounded-full border border-outline bg-transparent px-4 focus-within:bg-[color:rgba(11,87,208,0.08)] focus-within:text-on-surface-variant [&:not(:has(:placeholder-shown))]:bg-[color:rgba(11,87,208,0.08)]"
            >
                <mat-icon
                    class="mr-2 w-12 transition-[width] group-focus-within:w-0 group-[:not(:has(:placeholder-shown))]:w-0"
                >
                    search
                </mat-icon>
                <input
                    [(ngModel)]="searchFilter"
                    type="text"
                    placeholder="Search"
                    class="grow bg-transparent focus-visible:outline-0"
                />
                <div
                    class="flex h-12 w-12 items-center justify-center overflow-hidden transition-[width] group-[:has(:placeholder-shown)]:w-0"
                >
                    <button mat-icon-button (click)="searchFilter.set('')">
                        <mat-icon> close </mat-icon>
                    </button>
                </div>
            </label>

            <cdk-virtual-scroll-viewport itemSize="80">
                <mat-nav-list class="flex flex-col">
                    <div class="h-[80px]" *cdkVirtualFor="let conversation of conversations()">
                        <a mat-list-item class="!rounded-xl !bg-surface" tabindex="0">
                            <img
                                matListItemAvatar
                                [src]="'/api/pictures/by_id/' + conversation.other_user_id + '/0'"
                                alt="Avatar"
                            />
                            <span matListItemTitle>{{ conversation.other_username }}</span>
                            <span matListItemLine class="max-w-60 text-ellipsis">
                                @let message = conversation.last_message_content;
                                @if (message) {
                                    {{ message }}
                                } @else {
                                    Start a conversation together!
                                }
                            </span>
                            <span matListItemMeta>
                                {{ conversation.last_message_date | date: 'short' }}</span
                            >
                        </a>
                    </div>
                </mat-nav-list>

                @if (conversationsQuery.isFetchingNextPage()) {
                    <div class="flex h-12 items-center justify-center">
                        <mat-spinner diameter="32"></mat-spinner>
                    </div>
                } @else if (conversationsQuery.hasNextPage()) {
                    <div class="flex items-center justify-center">
                        <button mat-button (click)="conversationsQuery.fetchNextPage()">
                            Load more
                        </button>
                    </div>
                }
            </cdk-virtual-scroll-viewport>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationListComponent {
    #PAGE_SIZE = 10;
    #rpcClient = injectRpcClient();

    searchFilter = signal('');

    debouncedSearchFilter = toSignal(
        toObservable(this.searchFilter).pipe(debounceTime(300), distinctUntilChanged()),
    );

    conversationsQuery = injectInfiniteQuery(() => ({
        queryKey: ['conversations', this.debouncedSearchFilter()],
        queryFn: ({ pageParam, queryKey }) =>
            this.#rpcClient.getConversations({
                limit: this.#PAGE_SIZE,
                offset: pageParam * this.#PAGE_SIZE,
                usernameFilter: queryKey[1],
            }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (lastPage.users.length === 0) {
                return undefined;
            }
            return lastPageParam + 1;
        },
    }));

    conversations = computed<
        {
            other_user_id: string;
            other_username: string;
            last_message_content: string;
            last_message_sender: string;
            last_message_date: Date;
        }[]
    >(() => {
        const pages = this.conversationsQuery.data()?.pages ?? [];

        return pages.flatMap((page) => page.users);
    });
}
