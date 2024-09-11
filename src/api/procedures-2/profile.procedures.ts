import {
    badRequest,
    getSessionToken,
    procedure,
    ProcedureError,
    unauthorized,
} from '@api/lib-2/procedure';
import { sql } from '@api/connections/database';

/**
 * @throws {Unauthorized}
 */
export const getProfileProcedure = procedure('getProfile', async () => {
    const session = await getSessionToken();

    if (session instanceof ProcedureError) {
        return session;
    }

    return sql.begin(async (sql) => {
        const [profile]: [
            {
                username: string;
                first_name: string;
                last_name: string;
                age: string;
                sexual_pref: 'male' | 'female' | 'any';
                biography: string;
                gender: 'male' | 'female' | 'other';
            }?,
        ] = await sql`
            SELECT username, first_name, last_name, age, sexual_pref, biography, gender
            FROM sessions
            INNER JOIN public.users u on sessions.user_id = u.id
            WHERE token = ${session} AND sessions.expires_at > NOW()
        `;

        if (!profile) {
            return unauthorized();
        }

        return profile;
    });
});

/**
 * @throws {Unauthorized}
 */
export const getProfileByUsernameProcedure = procedure(
    'getProfileByUsername',
    {} as {
        username: string;
    },
    async ({ username }) => {
        const session_token = await getSessionToken();

        if (session_token instanceof ProcedureError) {
            return session_token;
        }

        // TODO: validate username
        if (!username) {
            return badRequest('USERNAME_REQUIRED');
        }

        return sql.begin(async (sql) => {
            // test session

            const [session]: [{ exists: boolean }?] = await sql`
                SELECT EXISTS(SELECT 1 FROM sessions 
                              WHERE token = ${session_token} AND sessions.expires_at > NOW()
                ) as exists
            `;

            if (!session?.exists) {
                return unauthorized();
            }

            const [profile]: [
                {
                    username: string;
                    first_name: string;
                    last_name: string;
                    age: string;
                    sexual_pref: 'male' | 'female' | 'any';
                    biography: string;
                    gender: 'male' | 'female' | 'other';
                }?,
            ] = await sql`
                SELECT username, first_name, last_name, age, sexual_pref, biography, gender
                FROM sessions
                         INNER JOIN public.users u on sessions.user_id = u.id
                WHERE username = ${username}
            `;

            if (!profile) {
                return unauthorized();
            }

            return profile;
        });
    },
);
