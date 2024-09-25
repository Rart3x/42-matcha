import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { validateUserId } from '@api/validators/profile.validators';
import { validateLimit, validateOffset } from '@api/validators/page.validators';

export const getMessagesByUserIdProcedure = procedure(
    'getMessagesByUserId',
    {} as {
        user_id: number;
        offset: number;
        limit: number;
    },
    async (params) => {
        const principal_user_id = await usePrincipalUser();

        const user_id = await validateUserId(params.user_id);
        const offset = await validateOffset(params.offset);
        const limit = await validateLimit(params.limit);

        return await sql.begin(async (sql) => {
            const messages = sql<
                {
                    id: number;
                    sender_id: number;
                    receiver_id: number;
                    message: string;
                    seen: boolean;
                    created_at: Date;
                }[]
            >`
            SELECT DISTINCT ON (sender_id, receiver_id)
                id,
                sender_id,
                receiver_id,
                message,
                is_seen,
                created_at
            FROM
                messages
            WHERE
                 (sender_id = ${principal_user_id} AND receiver_id = ${user_id})
              OR (sender_id = ${user_id} AND receiver_id = ${principal_user_id})
            ORDER BY
                created_at DESC
            OFFSET ${offset} LIMIT ${limit}
        `;
            return { messages };
        });
    },
);

export const getReadMessagesByUserIdProcedure = procedure(
    'getMessagesReadByUserId',
    {} as {
        user_id: number;

        offset: number;
        limit: number;
    },
    async (params) => {
        const principal_user_id = await usePrincipalUser();

        const user_id = await validateUserId(params.user_id);
        const offset = await validateOffset(params.offset);
        const limit = await validateLimit(params.limit);

        return await sql.begin(async (sql) => {
            const messages = sql<
                {
                    id: number;
                    sender_id: number;
                    receiver_id: number;
                    message: string;
                    seen: boolean;
                    created_at: Date;
                }[]
            >`
            SELECT DISTINCT ON (sender_id, receiver_id)
                id,
                sender_id,
                receiver_id,
                message,
                is_seen,
                created_at
            FROM
                messages
            WHERE
                  (sender_id = ${principal_user_id} AND receiver_id = ${user_id})
              AND is_seen = TRUE
            ORDER BY
                created_at DESC
            OFFSET ${offset} LIMIT ${limit}
        `;
            return { messages };
        });
    },
);

export const getUnreadMessagesByUserIdProcedure = procedure(
    'getMessagesUnreadByUserId',
    {} as {
        user_id: number;
        offset: number;
        limit: number;
    },
    async (params) => {
        const principal_user_id = await usePrincipalUser();

        const user_id = await validateUserId(params.user_id);
        const offset = await validateOffset(params.offset);
        const limit = await validateLimit(params.limit);

        return await sql.begin(async (sql) => {
            const messages = sql<
                {
                    id: number;
                    sender_id: number;
                    receiver_id: number;
                    message: string;
                    seen: boolean;
                    created_at: Date;
                }[]
            >`
            SELECT DISTINCT ON (sender_id, receiver_id)
                id,
                sender_id,
                receiver_id,
                message,
                is_seen,
                created_at
            FROM
                messages
            WHERE
                  (sender_id = ${principal_user_id} AND receiver_id = ${user_id})
              AND is_seen = FALSE
            ORDER BY
                created_at DESC
            OFFSET ${offset} LIMIT ${limit}
        `;
            return { messages };
        });
    },
);

export const getNumberOfUnreadMessagesByUserIdProcedure = procedure(
    'getNumberOfUnreadMessagesByUserId',
    {} as {
        user_id: number;
    },
    async (params) => {
        const principal_user_id = await usePrincipalUser();

        const user_id = await validateUserId(params.user_id);

        return await sql.begin(async (sql) => {
            const messages = sql<
                {
                    count: number;
                }[]
            >`
            SELECT
                COUNT(*)
            FROM
                messages
            WHERE
                  (sender_id = ${principal_user_id} AND receiver_id = ${user_id})
              AND is_seen = FALSE
        `;
            return { messages };
        });
    },
);

export const getConversationsProcedure = procedure(
    'getConversations',
    {} as {
        offset: number;
        limit: number;
    },
    async (params) => {
        const principal_user_id = await usePrincipalUser();

        const offset = await validateOffset(params.offset);
        const limit = await validateLimit(params.limit);

        const { users } = await sql.begin(async (sql) => {
            const users = await sql<
                {
                    other_user_id: string;
                    other_username: string;
                    last_message_content: string;
                    last_message_sender: string;
                    last_message_date: Date;
                }[]
            >`
            SELECT
                other_user_id,
                other_username,
                last_message_content,
                last_message_sender,
                last_message_date
            FROM
                conversations
            WHERE
                principal_user_id = ${principal_user_id}
            OFFSET ${offset} LIMIT ${limit}
            ;`;

            return { users };
        });

        return { users };
    },
);
