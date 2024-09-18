import { ChangeDetectionStrategy, Component } from '@angular/core';
import { injectInfiniteQuery } from '@tanstack/angular-query-experimental';
import { injectRpcClient } from '@app/core/http/rpc-client';

@Component({
    selector: 'app-chat-page',
    standalone: true,
    imports: [],
    template: ` <p>chat-page works!</p> `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatPageComponent {
    #PAGE_SIZE = 10;

    #rpcClient = injectRpcClient();

    chatsQuery = injectInfiniteQuery(() => ({
        queryKey: ['chats'],
        queryFn: ({ pageParam }) =>
            this.#rpcClient.getChattableUsers({
                limit: this.#PAGE_SIZE,
                offset: pageParam * this.#PAGE_SIZE,
            }),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages, lastPageParam) => {
            if (lastPage.users.length === 0) {
                return undefined;
            }
            return lastPageParam + 1;
        },
    }));
}
