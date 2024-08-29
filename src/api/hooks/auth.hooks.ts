import { err, ok, safeTry } from '@api/lib/result';
import { sql } from '@api/connections/database';
import { useClearCookie, useGetCookie } from '@api/lib/procedure';

export function useSessionCookie() {
    return safeTry(function* () {
        const token = useGetCookie('session');
        if (!token) {
            return err('Missing session cookie');
        }
        return ok(token);
    });
}

export function usePrincipalUser() {
    return safeTry(async function* () {
        const token = yield* useSessionCookie().safeUnwrap();

        const user_id = yield* (
            await sql.begin(async (sql) => {
                const users = await sql<{ id: string }[]>`
                    SELECT user_id
                    FROM sessions
                    WHERE token = ${token}
                        AND NOW() < expires_at
                `;

                if (users.length === 0) {
                    return err('Invalid session');
                }

                // refresh the session
                await sql<{ user_id: string }[]>`
                    UPDATE sessions 
                    SET updated_at = NOW()
                    WHERE token = ${token};
                `;

                return ok(users[0].id);
            })
        )
            .andThrough(() => {
                useClearCookie('session');
            })
            .safeUnwrap();

        return ok({ id: user_id });
    });
}
