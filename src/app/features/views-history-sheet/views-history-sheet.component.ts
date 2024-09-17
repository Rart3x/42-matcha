import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { SidesheetComponent } from '@app/shared/layouts/sidesheet-layout/sidesheet.component';
import { injectInfiniteQuery } from '@tanstack/angular-query-experimental';
import { injectRpcClient } from '@app/core/http/rpc-client';
import {
    MatList,
    MatListItem,
    MatListItemAvatar,
    MatListItemLine,
    MatListItemMeta,
    MatListItemTitle,
    MatNavList,
} from '@angular/material/list';
import {
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    CdkVirtualScrollableElement,
    CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-views-history-sheet',
    standalone: true,
    imports: [
        SidesheetComponent,
        MatList,
        MatListItem,
        MatListItemLine,
        MatListItemAvatar,
        MatListItemMeta,
        MatListItemTitle,
        MatNavList,
        CdkVirtualScrollViewport,
        CdkFixedSizeVirtualScroll,
        CdkVirtualForOf,
        CdkVirtualScrollableElement,
        MatButton,
        MatProgressSpinner,
    ],
    template: `
        <app-sidesheet heading="Views History">
            <div class="absolute inset-0 flex flex-col" cdkVirtualScrollingElement>
                @if (users().length > 0) {
                    <div class="mat-body-large p-4">People who visited your profile recently</div>
                } @else {
                    <div class="p-4 text-gray-500">Nobody has visited your profile yet.</div>
                }

                @if (users().length > 0) {
                    <div class="relative grow">
                        <cdk-virtual-scroll-viewport [itemSize]="64" class="absolute inset-0">
                            <mat-nav-list class="!p-2">
                                <a
                                    mat-list-item
                                    *cdkVirtualFor="let user of users()"
                                    class="h-[64px]"
                                >
                                    <img
                                        matListItemAvatar
                                        [src]="'/api/pictures/by_id/' + user.id + '/0'"
                                        alt="Avatar"
                                    />
                                    <span matListItemTitle>{{ user.first_name }}</span>
                                    <span matListItemLine class="max-w-40 text-ellipsis">
                                        {{ user.biography }}
                                    </span>
                                    <span matListItemMeta> {{ user.age }} yo </span>
                                </a>
                            </mat-nav-list>
                            <div class="m-4 flex justify-center">
                                @if (query.isFetchingNextPage()) {
                                    <mat-progress-spinner diameter="32" mode="indeterminate" />
                                } @else if (!query.hasNextPage()) {
                                    <span class="mat-body-1">No more recommendations</span>
                                } @else {
                                    <button mat-button (click)="query.fetchNextPage()">
                                        Load more
                                    </button>
                                }
                            </div>
                        </cdk-virtual-scroll-viewport>
                    </div>
                }
            </div>
        </app-sidesheet>
    `,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewsHistorySheetComponent {
    #PAGE_SIZE = 10;

    #rpcClient = injectRpcClient();

    query = injectInfiniteQuery(() => ({
        queryKey: ['views'],
        queryFn: ({ pageParam }) =>
            this.#rpcClient.getPrincipalUserVisits({
                offset: pageParam * this.#PAGE_SIZE,
                limit: this.#PAGE_SIZE,
            }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (lastPage.users.length === 0) {
                return undefined;
            }
            return lastPageParam + 1;
        },
    }));

    users = computed(() => this.query.data()?.pages.flatMap((page) => page.users) ?? []);
}
