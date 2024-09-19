import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { validateUserId } from '@api/validators/profile.validators';

export const createBlockProcedure = procedure(
    'createBlock',
    {} as {
        blocked_id: number;
    },
    async (params) => {
        const blocker_id = await usePrincipalUser();

        const blocked_id = await validateUserId(params.blocked_id);

        await sql`
            INSERT INTO blocks (blocker_user_id, blocked_user_id)
            VALUES (${blocker_id}, ${blocked_id})
        `;

        return { message: 'ok' };
    },
);

export const deleteBlockProcedure = procedure(
    'deleteBlock',
    {} as {
        blocked_id: number;
    },
    async (params) => {
        const blocker_id = await usePrincipalUser();

        const blocked_id = await validateUserId(params.blocked_id);

        await sql`
            DELETE
              FROM blocks
             WHERE blocker_user_id = ${blocker_id}
               AND blocked_user_id = ${blocked_id}
        `;

        return { message: 'ok' };
    },
);
