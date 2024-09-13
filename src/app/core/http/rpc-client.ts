import { inject, Injector } from '@angular/core';
import { assertInjector } from 'ngxtension/assert-injector';
import { HttpClient } from '@angular/common/http';
import { RpcRouter } from '@api/api';
import { firstValueFrom } from 'rxjs';

type Contracts = RpcRouter['__contracts'];

export type RpcClient = {
    [procedure in Contracts['__name']]: (
        data: Extract<Contracts, { __name: procedure }>['__params'],
    ) => Promise<Extract<Contracts, { __name: procedure }>['__result']>;
};

export function injectRpcClient(injector?: Injector) {
    return assertInjector(injectRpcClient, injector, () => {
        const http = inject(HttpClient);

        return new Proxy(
            {},
            {
                get: (_, procedure: Contracts['__name']) => (data: any) =>
                    firstValueFrom(
                        http.post<Extract<Contracts, { __name: typeof procedure }>['__result']>(
                            `/api/${procedure}`,
                            data,
                        ),
                    ),
            },
        ) as RpcClient;
    });
}
