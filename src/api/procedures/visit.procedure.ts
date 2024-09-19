import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { validateLimit, validateOffset } from '@api/validators/page.validators';
import { validateUserId } from '@api/validators/profile.validators';

export const createVisitProcedure = procedure(
    'createVisit',
    {} as {
        visited_id: number;
    },
    async (params) => {
        const visitor_id = await usePrincipalUser();

        const visited_id = await validateUserId(params.visited_id);

        return await sql`
            INSERT INTO visits (visiter_user_id, visited_user_id)
            VALUES (${visitor_id}, ${visited_id})
        `;
    },
);

export const deleteVisitProcedure = procedure(
    'deleteVisit',
    {} as {
        visited_id: number;
    },
    async (params) => {
        const visiter_id = await usePrincipalUser();

        const visited_id = await validateUserId(params.visited_id);

        await sql`
            DELETE
              FROM visits
             WHERE visiter_user_id = ${visiter_id}
               AND visited_user_id = ${visited_id}
        `;

        return { message: 'ok' };
    },
);

// TODO: review procedure name
export const getVisitsProcedure = procedure(
    'getVisitsByUserId',
    {} as {
        offset: number;
        limit: number;
    },
    async (params) => {
        const principal_user_id = await usePrincipalUser();

        const offset = await validateOffset(params.offset);
        const limit = await validateLimit(params.limit);

        const visits = sql<{ visiter_user_id: string }[]>`
            SELECT visiter_user_id
              FROM visits
             WHERE visited_user_id = ${principal_user_id}
             ORDER BY created_at DESC
            OFFSET ${offset} LIMIT ${limit}
        `;

        return { visits };
    },
);
