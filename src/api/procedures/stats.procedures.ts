import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { badRequest } from '@api/errors/bad-request.error';

/**
 * Get the stats of the principal user.
 */
export const getPrincipalUserStatsProcedure = procedure('getPrincipalUserStats', async () => {
    const principal_user_id = await usePrincipalUser();

    const [stats]: [{ likes: number; visits: number; fame_rating: number }?] = await sql`
        SELECT
            fame_rating,
            COUNT(DISTINCT likes.liker_user_id)    AS likes,
            COUNT(DISTINCT visits.visiter_user_id) AS visits
        FROM users AS principal_user
            LEFT JOIN likes
                ON likes.liked_user_id = principal_user.id
            LEFT JOIN visits
                ON visits.visited_user_id = principal_user.id
        WHERE
            principal_user.id = ${principal_user_id}
        GROUP BY
            fame_rating
        ;`;

    if (!stats) {
        throw badRequest();
    }

    return stats;
});
