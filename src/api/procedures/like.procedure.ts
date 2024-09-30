import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { validateLimit, validateOffset } from '@api/validators/page.validators';
import { validateUserId } from '@api/validators/profile.validators';

/**
 * Like a user
 */
export const createLikeProcedure = procedure(
    'createLike',
    {} as {
        liked_id: number;
    },
    async (params) => {
        const liker_id = await usePrincipalUser();

        const liked_id = await validateUserId(params.liked_id);

        await sql`
        INSERT INTO
            likes (liker_user_id, liked_user_id)
        VALUES
            (${liker_id}, ${liked_id})
        ;`;

        return { message: 'ok' };
    },
);

/**
 * Unlike a user
 */
export const deleteLikeProcedure = procedure(
    'deleteLike',
    {} as {
        liked_id: number;
    },
    async (params) => {
        const liker_id = await usePrincipalUser();

        const liked_id = await validateUserId(params.liked_id);

        await sql`
        DELETE
        FROM likes
        WHERE
              liker_user_id = ${liker_id}
          AND liked_user_id = ${liked_id}
        ;`;

        return { message: 'ok' };
    },
);

/**
 * Get users who liked the principal user ordered by most recent likes
 */
export const getPrincipalUserLikesProcedure = procedure(
    'getPrincipalUserLikes',
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
            liker.id,
            liker.username,
            liker.first_name,
            liker.last_name,
            liker.age,
            liker.biography
        FROM likes
            -- Get users who liked the principal user
            INNER JOIN reachable_users(${principal_user_id}) AS liker
                ON liker.id = likes.liker_user_id
        WHERE
            likes.liked_user_id = ${principal_user_id}
        ORDER BY
            likes.created_at DESC,
            liker.username
        OFFSET ${offset} LIMIT ${limit}
        ;`;

        return {
            users,
        };
    },
);
