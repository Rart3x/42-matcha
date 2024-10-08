import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { validateLimit, validateOffset } from '@api/validators/page.validators';

export const getNotificationsProcedure = procedure(
    'getNotifications',
    {} as {
        offset: number;
        limit: number;
    },
    async (params) => {
        const principal_user_id = await usePrincipalUser();

        const offset = await validateOffset(params.offset);
        const limit = await validateLimit(params.limit);

        const notifications = await sql<
            {
                id: number;
                notified_user_id: number;
                type: string;
                content: string;
                is_viewed: boolean;
                created_at: Date;
            }[]
        >`
        SELECT
            id,
            notified_user_id,
            type,
            content,
            is_viewed,
            created_at
        FROM notifications
        WHERE
            notifications.notified_user_id = ${principal_user_id}
        ORDER BY
            created_at DESC,
            id DESC
        OFFSET ${offset} LIMIT ${limit}
        ;`;

        const newNotifications = notifications.map((notification) => {
            return {
                ...notification,
                created_at: new Date(notification.created_at).toLocaleString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: 'short',
                }),
            };
        });

        return { notifications: newNotifications };
    },
);

export const getUnreadNotificationsCountProcedure = procedure(
    'getUnreadNotificationsCount',
    async () => {
        const principal_user_id = await usePrincipalUser();

        const [result]: [{ count: number }?] = await sql`
        SELECT
            COUNT(*) AS count
        FROM notifications
        WHERE
              notified_user_id = ${principal_user_id}
          AND is_viewed = FALSE
        ;`;

        return { count: result?.count ?? 0 };
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

        const offset = await validateOffset(params.offset);
        const limit = await validateLimit(params.limit);

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
            SELECT
                id,
                notified_user_id,
                content,
                is_viewed,
                created_at
            FROM notifications
            WHERE
                  notified_user_id = ${principal_user_id}
              AND is_viewed = FALSE
            ORDER BY
                created_at DESC
            OFFSET ${offset} LIMIT ${limit}
        `;
            return { notifications };
        });
    },
);
