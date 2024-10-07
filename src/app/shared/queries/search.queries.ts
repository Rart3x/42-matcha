import { injectRpcClient } from '@app/core/http/rpc-client';
import { computed, Injector } from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';
import { injectInfiniteQuery } from '@tanstack/angular-query-experimental';
import { computedPrevious } from 'ngxtension/computed-previous';

export function injectSearchUsersQuery(
    propsFactory: () => {
        maximum_age_gap?: number;
        maximum_fame_rating_gap?: number;
        maximum_distance?: number;
        required_tags?: string[];
        orderBy: 'age' | 'distance' | 'fame_rating' | 'common_tags';
    },
    injector?: Injector,
) {
    return assertInjector(injectSearchUsersQuery, injector, () => {
        const PAGE_SIZE = 10;

        const rpcClient = injectRpcClient();

        const { data, isPending, hasNextPage, fetchNextPage } = injectInfiniteQuery(() => ({
            queryKey: ['searchUsers', propsFactory()] as const,
            queryFn: ({ queryKey, pageParam }) =>
                rpcClient.searchUsers({
                    ...queryKey[1],
                    offset: pageParam * PAGE_SIZE,
                    limit: PAGE_SIZE,
                }),
            initialPageParam: 0,
            getNextPageParam: (lastPage, allPages) => {
                const lastPageUsers = lastPage.users;
                return lastPageUsers.length === 0 ? undefined : allPages.length;
            },
        }));

        const flatResults = computed(() => data()?.pages.flatMap((page) => page.users) ?? []);
        const prevResults = computedPrevious(flatResults);
        const results = computed(() => (isPending() ? prevResults() : flatResults()));

        return {
            /** The search results. */
            results,
            /** Whether the results are being fetched. */
            isPending,
            /** Whether there are more results to fetch. */
            hasNextPage,
            /** Fetches the next page of results. */
            fetchNextPage,
        };
    });
}
