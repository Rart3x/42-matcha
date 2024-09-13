import { useClearCookie, useGetCookie, useSetCookie } from '@api/hooks/cookie.hooks';
import { unauthorized } from '@api/errors/unauthorized.error';
import { sql } from '@api/connections/database.connection';

const SESSION_COOKIE_NAME = 'session';

export function useGetSessionCookie() {
    const getCookie = useGetCookie();

    return getCookie(SESSION_COOKIE_NAME);
}

export function useSetSessionCookie() {
    const setCookie = useSetCookie();

    return (token: string) =>
        setCookie(SESSION_COOKIE_NAME, token, {
            httpOnly: true,
            sameSite: 'strict',
        });
}

export function useClearSessionCookie() {
    const clearCookie = useClearCookie();

    return () => clearCookie(SESSION_COOKIE_NAME);
}

/**
 * @throws UnauthorizedError
 */
export async function usePrincipalUser() {
    const clearCookie = useClearCookie();
    const token = useGetSessionCookie();

    if (!token) {
        throw unauthorized();
    }

    return sql
        .begin(async (sql) => {
            // refresh the session
            const [users]: [{ user_id: string }?] = await sql`
                UPDATE sessions 
                SET updated_at = NOW()
                WHERE token = ${token}
                    AND NOW() < expires_at
                RETURNING user_id;
            `;

            if (!users) {
                throw unauthorized();
            }

            return users.user_id;
        })
        .catch((err) => {
            clearCookie(SESSION_COOKIE_NAME);
            throw err;
        });
}
