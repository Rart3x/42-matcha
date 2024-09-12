import { asyncLocalRouterStorage } from '@api/lib/procedure';

export function useRouterContext() {
    const ctx = asyncLocalRouterStorage.getStore();
    if (!ctx) {
        console.error('Router context is not available');
        throw Error();
    }
    return ctx;
}
