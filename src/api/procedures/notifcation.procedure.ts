import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { limitValidator, offsetValidator } from '@api/validators/page.validators';

export const getNotificationsProcedure = procedure(
    'getNotificationsByUserId',
    {} as {
        offset: number;
        limit: number;
    },
    async (params) => {
        const principal_user_id = await usePrincipalUser();

        const offset = offsetValidator(params.offset);
        const limit = limitValidator(params.limit);

        return await sql.begin(async (sql) => {
            const notifications = sql<
                {
                    id: number;
                    user_id: number;
                    message: string;
                    viewed: boolean;
                    created_at: Date;
                }[]
            >`
                SELECT id, user_id, message, viewed, created_at
                FROM notifications
                WHERE user_id = ${principal_user_id}
                ORDER BY created_at DESC
                OFFSET ${offset} LIMIT ${limit}
            `;
            return { notifications };
        });
    },
);

export const getNumberOfUnreadNotificationsProcedure = procedure(
    'getNumberOfUnreadNotificationsByUserId',
    {},
    async () => {
        const principal_user_id = await usePrincipalUser();

        return sql<
            {
                count: number;
            }[]
        >`
            SELECT COUNT(*) as count
            FROM notifications
            WHERE user_id = ${principal_user_id}
            AND viewed = FALSE
        `;
    },
);

export const getUnreadNotificationsProcedure = procedure(
    'getUnreadNotificationsByUserId',
    {} as {
        offset: number;
        limit: number;
    },
    async (params) => {
        const principal_user_id = await usePrincipalUser();

        const offset = offsetValidator(params.offset);
        const limit = limitValidator(params.limit);

        return await sql.begin(async (sql) => {
            const notifications = sql<
                {
                    id: number;
                    user_id: number;
                    message: string;
                    viewed: boolean;
                    created_at: Date;
                }[]
            >`
                SELECT id, user_id, message, viewed, created_at
                FROM notifications
                WHERE user_id = ${principal_user_id}
                AND viewed = FALSE
                ORDER BY created_at DESC
                OFFSET ${offset} LIMIT ${limit}
            `;
            return { notifications };
        });
    },
);
