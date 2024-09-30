import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { validateLimit, validateOffset } from '@api/validators/page.validators';

/**
 * Get users who visited the principal user ordered by most recent visits
 */
export const getPrincipalUserVisitsProcedure = procedure(
    'getPrincipalUserVisits',
    {} as {
        offset: number;
        limit: number;
    },
    async (params) => {
        const principal_user_id = await usePrincipalUser();

        const offset = await validateOffset(params.offset);
        const limit = await validateLimit(params.limit);

        const users = await sql<
            {
                id: number;
                username: string;
                first_name: string;
                last_name: string;
                age: number;
                biography: string;
            }[]
        >`
        SELECT
            visiter.id,
            visiter.username,
            visiter.first_name,
            visiter.last_name,
            visiter.age,
            visiter.biography
        FROM visits
            -- Get users who visited the principal user
            INNER JOIN reachable_users(${principal_user_id}) AS visiter
                ON visiter.id = visits.visiter_user_id
        WHERE
            visits.visited_user_id = ${principal_user_id}
        ORDER BY
            visits.created_at DESC,
            visiter.username
        OFFSET ${offset} LIMIT ${limit}
        ;`;

        return {
            users,
        };
    },
);
