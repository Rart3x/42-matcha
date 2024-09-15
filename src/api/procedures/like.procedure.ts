import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { limitValidator, offsetValidator } from '@api/validators/page.validators';
import { validateUserId } from '@api/validators/profile.validators';

export const createLikeProcedure = procedure(
    'createLike',
    {} as {
        liked_id: number;
    },
    async (params) => {
        const liker_id = await usePrincipalUser();

        const liked_id = await validateUserId(params.liked_id);

        return await sql`
            INSERT INTO likes (liker_id, liked_user_id)
            VALUES (${liker_id}, ${liked_id})
        `;
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

        return await sql`
            DELETE FROM likes
            WHERE liker_id = ${liker_id}
            AND liked_user_id = ${liked_id}
        `;
    },
);

export const getLikesProcedure = procedure(
    'getLikesByUserId',
    {} as {
        offset: number;
        limit: number;
    },
    async (params) => {
        const principal_user_id = await usePrincipalUser();

        const offset = await offsetValidator(params.offset);
        const limit = await limitValidator(params.limit);

        return await sql`
            SELECT liker_id
            FROM likes
            WHERE liked_user_id = ${principal_user_id}
            ORDER BY created_at DESC
            OFFSET ${offset} LIMIT ${limit}
        `;
    },
);
