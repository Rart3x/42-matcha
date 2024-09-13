import { useRouterContext } from '@api/lib/use-router-context.hook';
import { CookieOptions } from 'express';

export function useGetCookie() {
    const ctx = useRouterContext();

    return (name: string) => ctx.request.cookies?.[name] as string | undefined;
}

export function useSetCookie() {
    const ctx = useRouterContext();

    return (name: string, value: string, options?: CookieOptions) => {
        ctx.response.cookie(name, value, options ?? {});
    };
}

export function useClearCookie() {
    const ctx = useRouterContext();

    return (name: string) => {
        ctx.response.clearCookie(name);
    };
}
