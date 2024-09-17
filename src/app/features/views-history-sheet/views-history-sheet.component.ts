import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { SidesheetComponent } from '@app/shared/layouts/sidesheet-layout/sidesheet.component';
import { injectInfiniteQuery } from '@tanstack/angular-query-experimental';
import { injectRpcClient } from '@app/core/http/rpc-client';

@Component({
    selector: 'app-views-history-sheet',
    standalone: true,
    imports: [SidesheetComponent],
    template: `
        <app-sidesheet heading="Views History">
            <div class="gap2 flex flex-col">
                @for (user of users(); track user.id) {
                    <div>
                        {{ user.username }}
                    </div>
                }
                @if (users().length === 0) {
                    <div class="text-gray-500">Nobody has visited your profile yet.</div>
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
