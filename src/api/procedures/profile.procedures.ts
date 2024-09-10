import { procedure } from '@api/lib/procedure';
import { ok, safeTry } from '@api/lib/result';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { sql } from '@api/connections/database';

export const getProfile = procedure('getProfile', () => {
    return safeTry(async function* () {
        const profile = yield* (
            await sql.begin((sql) => {
                return safeTry(async function* () {
                    const { id } = yield* (await usePrincipalUser()).safeUnwrap();

                    const [profile]: [
                        {
                            username: string;
                            first_name: string;
                            last_name: string;
                            age: number;
                            sexual_pref: string;
                            biography: string;
                            gender: string;
                        },
                    ] = await sql`
                        SELECT username, first_name, last_name, age, sexual_pref, biography, gender
                        FROM users
                        WHERE id = ${id}
                    `;

                    return ok(profile);
                });
            })
        ).safeUnwrap();

        return ok(profile);
    });
});
