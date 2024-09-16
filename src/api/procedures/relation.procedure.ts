import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { validateLimit, validateOffset } from '@api/validators/page.validators';
import { badRequest } from '@api/errors/bad-request.error';

export const getPrincipalUserStatsProcedure = procedure('getPrincipalUserStats', async () => {
    const user_id = await usePrincipalUser();

    const [stats]: [{ likes: number; visits: number; blocks: number }?] = await sql`
        SELECT 
            COUNT(DISTINCT likes.user_id) as likes,
            COUNT(DISTINCT visits.user_id) as visits,
            COUNT(DISTINCT blocks.user_id) as blocks
        FROM users
            LEFT JOIN likes ON likes.liked_user_id = users.id
            LEFT JOIN visits ON visits.visited_user_id = users.id
            LEFT JOIN blocks ON blocks.blocked_user_id = users.id
        WHERE users.id = ${user_id}
        `;

    if (!stats) {
        throw badRequest();
    }

    return stats;
});

export const getPrincipalUserLikesProcedure = procedure(
    'getPrincipalUserLikes',
    {} as {
        offset: number;
        limit: number;
    },
    async (params) => {
        const offset = await validateOffset(params.offset);
        const limit = await validateLimit(params.limit);
        const user_id = await usePrincipalUser();

        return sql<
            {
                id: number;
                username: string;
                first_name: string;
                last_name: string;
                age: number;
            }[]
        >`
            SELECT id, username, first_name, last_name, age
            FROM likes
                     LEFT JOIN users ON users.id = likes.liked_user_id
            WHERE likes.user_id = ${user_id}
            ORDER BY likes.created_at DESC
            OFFSET ${offset} LIMIT ${limit}
        `;
    },
);

export const getPrincipalUserVisitsProcedure = procedure(
    'getPrincipalUserVisits',
    {} as {
        offset: number;
        limit: number;
    },
    async (params) => {
        const offset = await validateOffset(params.offset);
        const limit = await validateLimit(params.limit);
        const user_id = await usePrincipalUser();

        return sql<
            {
                id: number;
                username: string;
                first_name: string;
                last_name: string;
                age: number;
            }[]
        >`
            SELECT id, username, first_name, last_name, age
            FROM visits
                     LEFT JOIN users ON users.id = visits.visited_at
            WHERE visits.user_id = ${user_id}
            ORDER BY visits.visited_at DESC
            OFFSET ${offset} LIMIT ${limit}
        `;
    },
);
