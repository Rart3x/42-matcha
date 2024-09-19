import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { validateLimit, validateOffset } from '@api/validators/page.validators';
import { validateUserId } from '@api/validators/profile.validators';

export const createLikeProcedure = procedure(
    'createLike',
    {} as {
        liked_id: number;
    },
    async (params) => {
        const liker_id = await usePrincipalUser();

        const liked_id = await validateUserId(params.liked_id);

        await sql`
            INSERT INTO likes (liker_user_id, liked_user_id)
            VALUES (${liker_id}, ${liked_id})
        `;

        return { message: 'ok' };
    },
);

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
             WHERE liker_user_id = ${liker_id}
               AND liked_user_id = ${liked_id}
        `;

        return { message: 'ok' };
    },
);

// TODO: might not be needed
export const getLikesProcedure = procedure(
    'getLikesByUserId',
    {} as {
        offset: number;
        limit: number;
    },
    async (params) => {
        const principal_user_id = await usePrincipalUser();

        const offset = await validateOffset(params.offset);
        const limit = await validateLimit(params.limit);

        const likes = await sql<{ liker_user_id: string }[]>`
            SELECT liker_user_id
              FROM likes
             WHERE liked_user_id = ${principal_user_id}
             ORDER BY created_at DESC
            OFFSET ${offset} LIMIT ${limit}
        `;

        return { likes };
    },
);
