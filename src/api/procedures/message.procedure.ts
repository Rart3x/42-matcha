import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { validateUserId } from '@api/validators/profile.validators';
import { validateLimit, validateOffset } from '@api/validators/page.validators';
import { validateUsernameFilter } from '@api/validators/account.validators';
import { validateMessage } from '@api/validators/message.validators';

/**
 * Get messages exchanged between the principal user and another user identified by their user_id.
 */
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
            sender.id       AS sender_id,
            sender.username AS sender_username,
            messages.receiver_id,
            messages.message,
            messages.is_seen,
            messages.created_at
        FROM messages
            JOIN users AS sender
                ON messages.sender_id = sender.id
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

/**
 * Send a new message to another user identified by their user_id.
 */
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
            FROM messages
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

        const users = await sql<
            {
                other_user_id: string;
                other_username: string;
                last_message_content: string;
                last_message_sender: string;
                last_message_date: Date;
            }[]
        >`
        WITH
            latest_messages AS (
                SELECT
                    sender_id,
                    receiver_id,
                    message,
                    created_at,
                    ROW_NUMBER()
                    OVER ( PARTITION BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id) ORDER BY created_at DESC ) AS rn
                FROM messages
            )
        SELECT DISTINCT
            other_user.id                                                                         AS other_user_id,
            other_user.username                                                                   AS other_username,
            CASE WHEN lm.sender_id = ${principal_user_id} THEN 'you'
                 ELSE other_user.username END                                                     AS last_message_sender,
            lm.message                                                                            AS last_message_content,
            lm.created_at                                                                         AS last_message_date
        FROM connected_users(${principal_user_id}) AS other_user
            LEFT JOIN latest_messages AS lm
                ON LEAST(lm.sender_id, lm.receiver_id) = ${principal_user_id} AND
                   GREATEST(lm.sender_id, lm.receiver_id) = other_user.id AND lm.rn = 1
        WHERE
            -- Filter by username
            other_user.username ILIKE ${usernameFilter} || '%'
        ORDER BY
            last_message_date DESC NULLS LAST,
            other_user.username
        OFFSET ${offset} LIMIT ${limit}
        ;`;

        return { users };
    },
);
