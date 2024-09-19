import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { validateUserId } from '@api/validators/profile.validators';

export const createFakeUserReportProcedure = procedure(
    'createFakeUserReport',
    {} as {
        reported_id: number;
    },
    async (params) => {
        const reporter_id = await usePrincipalUser();

        const reported_id = await validateUserId(params.reported_id);

        return await sql`
            INSERT INTO fake_user_reports (reporter_user_id, reported_user_id)
            VALUES (${reporter_id}, ${reported_id})
        `;
    },
);

export const deleteFakeUserReportProcedure = procedure(
    'deleteFakeUserReport',
    {} as {
        reported_id: number;
    },
    async (params) => {
        const reporter_id = await usePrincipalUser();

        const reported_id = await validateUserId(params.reported_id);

        return await sql`
            DELETE FROM fake_user_reports
            WHERE reporter_user_id = ${reporter_id}
            AND reported_user_id = ${reported_id}
        `;
    },
);
