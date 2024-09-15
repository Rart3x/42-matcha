import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { validateUserId } from '@api/validators/profile.validators';

export const getMessagesByUserIdProcedure = procedure(
    'getMessagesByUserId',
    {} as {
        user_id: number;
    },
    async (params) => {
        const principal_user_id = await usePrincipalUser();

        const user_id = validateUserId(params.user_id);

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
                    id, sender_id, receiver_id, message, seen, created_at
                FROM 
                    messages
                WHERE 
                    (sender_id = ${principal_user_id} AND receiver_id = ${user_id}) OR
                    (sender_id = ${user_id} AND receiver_id = ${principal_user_id})
                ORDER BY created_at DESC
            `;
            return { messages };
        });
    },
);

export const getReadMessagesByUserIdProcedure = procedure(
    'getMessagesReadByUserId',
    {} as {
        user_id: number;
    },
    async (params) => {
        const principal_user_id = await usePrincipalUser();

        const user_id = validateUserId(params.user_id);

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
                    id, sender_id, receiver_id, message, seen, created_at
                FROM 
                    messages
                WHERE 
                    (sender_id = ${principal_user_id} AND receiver_id = ${user_id})
                AND
                    seen = TRUE
                ORDER BY created_at DESC
            `;
            return { messages };
        });
    },
);

export const getUnreadMessagesByUserIdProcedure = procedure(
    'getMessagesUnreadByUserId',
    {} as {
        user_id: number;
    },
    async (params) => {
        const principal_user_id = await usePrincipalUser();

        const user_id = validateUserId(params.user_id);

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
                    id, sender_id, receiver_id, message, seen, created_at
                FROM 
                    messages
                WHERE 
                    (sender_id = ${principal_user_id} AND receiver_id = ${user_id})
                AND
                    seen = FALSE
                ORDER BY created_at DESC
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

        const user_id = validateUserId(params.user_id);

        return await sql.begin(async (sql) => {
            const messages = sql<
                {
                    count: number;
                }[]
            >`
                SELECT COUNT(*)
                FROM 
                    messages
                WHERE 
                    (sender_id = ${principal_user_id} AND receiver_id = ${user_id})
                AND
                    seen = FALSE
            `;
            return { messages };
        });
    },
);
