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
                SELECT DISTINCT ON (sender_id, receiver_id) id,
                                                            sender_id,
                                                            receiver_id,
                                                            message,
                                                            seen,
                                                            created_at
                FROM messages
                WHERE (sender_id = ${principal_user_id} AND receiver_id = ${user_id})
                   OR (sender_id = ${user_id} AND receiver_id = ${principal_user_id})
                ORDER BY created_at DESC
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
                SELECT DISTINCT ON (sender_id, receiver_id) id,
                                                            sender_id,
                                                            receiver_id,
                                                            message,
                                                            seen,
                                                            created_at
                FROM messages
                WHERE (sender_id = ${principal_user_id}
                    AND receiver_id = ${user_id})
                  AND seen = TRUE
                ORDER BY created_at DESC
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
                SELECT DISTINCT ON (sender_id, receiver_id) id,
                                                            sender_id,
                                                            receiver_id,
                                                            message,
                                                            seen,
                                                            created_at
                FROM messages
                WHERE (sender_id = ${principal_user_id}
                    AND receiver_id = ${user_id})
                  AND seen = FALSE
                ORDER BY created_at DESC
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
                SELECT COUNT(*)
                FROM messages
                WHERE (sender_id = ${principal_user_id}
                    AND receiver_id = ${user_id})
                  AND seen = FALSE
            `;
            return { messages };
        });
    },
);

export const getChattableUsersProcedure = procedure(
    'getChattableUsers',
    {} as {
        offset: number;
        limit: number;
    },
    async (params) => {
        const principal_user_id = await usePrincipalUser();

        const offset = await validateOffset(params.offset);
        const limit = await validateLimit(params.limit);

        return await sql.begin(async (sql) => {
            const users = sql<
                {
                    id: number;
                    username: string;
                    last_message_content: string;
                    last_message_seen: boolean;
                    last_message_author_id: number;
                    last_message_created_at: Date;
                }[]
            >`
                SELECT users.id,
                       users.username,
                       messages.message    as last_message_content,
                       messages.seen       as last_message_seen,
                       messages.sender_id  as last_message_author_id,
                       messages.created_at as last_message_created_at
                FROM users
                         LEFT JOIN messages
                                   ON (users.id = messages.sender_id AND messages.receiver_id = ${principal_user_id})
                                       OR
                                      (users.id = messages.receiver_id AND messages.sender_id = ${principal_user_id})
                         LEFT JOIN blocks
                                   ON (users.id = blocks.user_id AND blocks.blocked_user_id = ${principal_user_id})
                                       OR (users.id = blocks.blocked_user_id AND blocks.user_id = ${principal_user_id})
                WHERE users.id != ${principal_user_id} -- can't chat with self
                  AND blocks.blocked_user_id IS NULL   -- can't see blocked users or be seen by them
                ORDER BY messages.created_at DESC, messages.seen, users.username, messages.message == NULL DESC
                OFFSET ${offset} LIMIT ${limit}
            `;
            return { users };
        });
    },
);
