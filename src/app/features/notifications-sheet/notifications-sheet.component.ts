import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { SidesheetComponent } from '@app/shared/layouts/sidesheet-layout/sidesheet.component';
import {
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    CdkVirtualScrollableElement,
    CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { injectInfiniteQuery, injectQueryClient } from '@tanstack/angular-query-experimental';
import { injectRpcClient } from '@app/core/http/rpc-client';
import {
    MatList,
    MatListItem,
    MatListItemLine,
    MatListItemMeta,
    MatListItemTitle,
    MatNavList,
} from '@angular/material/list';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-notifications-sheet',
    standalone: true,
    imports: [
        SidesheetComponent,
        CdkVirtualScrollableElement,
        CdkVirtualScrollViewport,
        MatNavList,
        CdkFixedSizeVirtualScroll,
        MatList,
        MatListItem,
        MatListItemTitle,
        CdkVirtualForOf,
        MatListItemTitle,
        MatListItemLine,
        MatListItemMeta,
        MatButton,
    ],
    template: `
        <app-sidesheet heading="Notifications">
            <div
                class="absolute inset-0 flex flex-col items-stretch !overflow-x-hidden px-2"
                cdkVirtualScrollingElement
            >
                @if (notifications().length > 0) {
                    <cdk-virtual-scroll-viewport [itemSize]="100" class="w-full max-w-full">
                        <mat-list class="flex w-full items-center">
                            <div
                                class="h-[100px] py-2"
                                *cdkVirtualFor="let notification of notifications()"
                            >
                                <mat-list-item
                                    class="!h-[calc(100px-1rem)] !w-[380px] overflow-hidden !rounded-2xl border bg-surface"
                                >
                                    <span matListItemTitle>
                                        @switch (notification.type) {
                                            @case ('visit') {
                                                Visit
                                            }
                                            @case ('like') {
                                                Like
                                            }
                                            @case ('unlike') {
                                                Unlike
                                            }
                                            @case ('match') {
                                                Match
                                            }
                                            @case ('message') {
                                                Message
                                            }
                                        }
                                    </span>
                                    <span matListItemLine class="!overflow-auto !whitespace-normal">
                                        {{ notification.content }}
                                    </span>
                                    <span matListItemMeta>{{ notification.created_at }}</span>
                                </mat-list-item>
                            </div>
                        </mat-list>
                    </cdk-virtual-scroll-viewport>

                    @if (query.hasNextPage()) {
                        <div class="flex justify-center py-2">
                            <button mat-button (click)="query.fetchNextPage()">Load more</button>
                        </div>
                    }
                } @else {
                    <div class="p-4 text-gray-500">No notifications yet.</div>
                }
            </div>
        </app-sidesheet>
    `,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsSheetComponent {
    #rpcClient = injectRpcClient();
    #queryClient = injectQueryClient();

    PAGE_SIZE = 10;

    query = injectInfiniteQuery(() => ({
        queryKey: ['notifications'],
        queryFn: ({ pageParam }) =>
            this.#rpcClient.getNotifications({
                offset: this.PAGE_SIZE * pageParam,
                limit: this.PAGE_SIZE,
            }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, _allPages, lastPageParam) => {
            if (lastPage.notifications.length < this.PAGE_SIZE) {
                return undefined;
            }
            return lastPageParam + 1;
        },
        onSuccess: async () => {
            await this.#queryClient.invalidateQueries({ queryKey: ['notifications', 'count'] });
        },
    }));

    notifications = computed(
        () => this.query.data()?.pages.flatMap((page) => page.notifications) ?? [],
    );
}
