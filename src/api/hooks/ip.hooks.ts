import { useRouterContext } from '@api/lib/use-router-context.hook';

export function useGetIp() {
    const ctx = useRouterContext();

    return ctx.request.ip;
}
