import { ChangeDetectionStrategy, Component } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { injectRpcClient } from '@app/core/http/rpc-client';

@Component({
    selector: 'app-browse-panel',
    standalone: true,
    imports: [],
    template: ` <p>browse-panel works!</p> `,
    styles: ``,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrowsePanelComponent {
    #rpcClient = injectRpcClient();

    recommendations = injectQuery(() => ({
        queryKey: [
            'recommendations',
            {
                orderBy: 'fame_rating',
            },
        ] as const,
        queryFn: ({ queryKey: [_, params] }) => this.#rpcClient.browseUsers(params),
    }));
}
