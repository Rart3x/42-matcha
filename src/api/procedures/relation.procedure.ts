import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { validateLimit, validateOffset } from '@api/validators/page.validators';
import { badRequest } from '@api/errors/bad-request.error';

export const getPrincipalUserStatsProcedure = procedure('getPrincipalUserStats', async () => {
    const principal_user_id = await usePrincipalUser();

    const [stats]: [{ likes: number; visits: number; fame_rating: number }?] = await sql`
        SELECT fame_rating,
               COUNT(DISTINCT likes.liked_user_id)    as likes,
               COUNT(DISTINCT visits.visited_user_id) as visits
        FROM users
                 LEFT JOIN likes ON likes.liked_user_id = users.id
                 LEFT JOIN visits ON visits.visited_user_id = users.id
                 LEFT JOIN blocks ON blocks.blocked_user_id = users.id
        WHERE users.id = ${principal_user_id}
        GROUP BY fame_rating
    `;

    if (!stats) {
        throw badRequest();
    }

    return stats;
});

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
        SELECT id, username, first_name, last_name, age, biography
        FROM visits
                 INNER JOIN users ON users.id = visits.visited_user_id
        WHERE visits.visited_user_id = ${principal_user_id}
        ORDER BY visits.created_at DESC
        OFFSET ${offset} LIMIT ${limit}
    `;

        return {
            users,
        };
    },
);
