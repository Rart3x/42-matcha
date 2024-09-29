import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { validateUserId } from '@api/validators/profile.validators';
import { validateLimit, validateOffset } from '@api/validators/page.validators';
import { validateUsernameFilter } from '@api/validators/account.validators';
import { validateMessage } from '@api/validators/message.validators';

export const getMessagesByUserIdProcedure = procedure(
    'getMessagesByUserId',
    {} as {
        other_user_id: number;
        offset: number;
        limit: number;
    },
    async (params) => {
        const principal_user_id = await usePrincipalUser();

        const user_id = await validateUserId(params.other_user_id);
        const offset = await validateOffset(params.offset);
        const limit = await validateLimit(params.limit);

        const messages = await sql<
            {
                id: number;
                sender_id: number;
                sender_username: string;
                receiver_id: number;
                message: string;
                seen: boolean;
                created_at: Date;
            }[]
        >`
        SELECT
            messages.id,
            sender.id as sender_id,
            sender.username as sender_username,
            receiver_id,
            message,
            is_seen,
            messages.created_at
        FROM
            messages
        JOIN users as sender ON messages.sender_id = sender.id
        WHERE
             (sender_id = ${principal_user_id} AND receiver_id = ${user_id})
          OR (sender_id = ${user_id} AND receiver_id = ${principal_user_id})
        ORDER BY
            created_at DESC
        OFFSET ${offset} LIMIT ${limit}
        ;`;

        return { messages };
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
        usernameFilter?: string;
    },
    async (params) => {
        const principal_user_id = await usePrincipalUser();

        const offset = await validateOffset(params.offset);
        const limit = await validateLimit(params.limit);
        const usernameFilter = await validateUsernameFilter(params.usernameFilter ?? '');

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
              AND other_username ILIKE ${usernameFilter} || '%'
            OFFSET ${offset} LIMIT ${limit}
            ;`;

            return { users };
        });

        return { users };
    },
);

export const postMessageProcedure = procedure(
    'postMessage',
    {} as {
        receiver_id: number;
        message: string;
    },
    async (params) => {
        const principal_user_id = await usePrincipalUser();

        const receiver_id = await validateUserId(params.receiver_id);
        const message = await validateMessage(params.message);

        await sql`
        INSERT INTO
            messages (sender_id, receiver_id, message)
        VALUES
            (${principal_user_id}, ${receiver_id}, ${message})
        ;`;

        return { message: 'Message sent' };
    },
);
