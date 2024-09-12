import { procedure } from '../lib/procedure';
import { ok, safeTry } from '../lib/result';
import { usePrincipalUser } from '../hooks/auth.hooks';
import { sql } from '../connections/database';

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
                            sexual_pref: 'male' | 'female' | 'any';
                            biography: string;
                            gender: 'male' | 'female' | 'other';
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
