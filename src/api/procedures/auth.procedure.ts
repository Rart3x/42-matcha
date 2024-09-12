import { procedure } from '@api/lib/procedure';
import {
    useClearSessionCookie,
    useGetSessionCookie,
    usePrincipalUser,
    useSetSessionCookie,
} from '@api/hooks/auth.hooks';
import { badRequest } from '@api/errors/bad-request.error';
import { sql } from '@api/connections/database.connection';

export const loginProcedure = procedure(
    'login',
    {} as { username: string; password: string },
    async ({ username, password }) => {
        const setSessionCookie = useSetSessionCookie();

        if (!username || !password) {
            throw badRequest();
        }

        const [session]: [{ token: string }?] = await sql`
            INSERT INTO sessions (user_id)
            SELECT id FROM users
            WHERE username = ${username} AND password = crypt(${password}, password)
            RETURNING token
        `;

        if (!session) {
            throw badRequest();
        }

        setSessionCookie(session.token);

        return { message: 'ok' };
    },
);

export const logoutProcedure = procedure('logout', async () => {
    const clearSessionCookie = useClearSessionCookie();
    const session = useGetSessionCookie();

    if (!session) {
        throw badRequest();
    }

    await sql`
        DELETE FROM sessions
        WHERE token = ${session}
    `;

    clearSessionCookie();

    return { message: 'ok' };
});

export const verifySessionProcedure = procedure('verifySession', async () => {
    const user = await usePrincipalUser();

    return { message: 'ok' };
});
