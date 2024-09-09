import { procedure, useClearCookie, useSetCookie } from '@api/lib/procedure';
import { err, ok, safeTry } from '@api/lib/result';
import { sql } from '@api/connections/database';
import { usePrincipalUser } from '@api/hooks/auth.hooks';

export const loginProcedure = procedure(
    'login',
    {} as { username: string; password: string },
    ({ username, password }) => {
        return safeTry(async function* () {
            const setCookie = useSetCookie();

            if (!username || !password) {
                return err('Invalid username or password');
            }

            const token = yield* (
                await sql.begin((sql) =>
                    safeTry(async function* () {
                        const users = await sql<{ id: string }[]>`
                            SELECT id 
                            FROM users 
                            WHERE username = ${username} AND password = crypt(${password}, password)
                        `;

                        if (users.length === 0) {
                            return err('Invalid username or password');
                        }

                        const sessions = await sql<{ token: string }[]>`
                            INSERT INTO sessions (user_id)
                            VALUES (${users[0].id})
                            RETURNING token
                        `;

                        if (sessions.length === 0) {
                            return err('Failed to create session');
                        }

                        return ok(sessions[0].token);
                    }),
                )
            ).safeUnwrap();

            setCookie('session', token, {
                httpOnly: true,
                sameSite: 'strict',
            });

            return ok({ message: 'logged in' });
        });
    },
);

export const logoutProcedure = procedure('logout', () => {
    return safeTry(async function* () {
        const clearCookie = useClearCookie();
        const { id } = yield* (await usePrincipalUser()).safeUnwrap();

        const res = await sql`
            DELETE FROM sessions
            WHERE user_id = ${id}
        `;

        if (res.count === 0) {
            return err('Failed to log out');
        }

        clearCookie('session');

        return ok({ message: 'logged out' });
    });
});

export const verifySessionProcedure = procedure('verify', () => {
    return safeTry(async function* () {
        yield* (await usePrincipalUser()).safeUnwrap();

        return ok({ message: 'session verified' });
    });
});
