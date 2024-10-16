import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { validatePassword } from '@api/validators/account.validators';
import { validateNewPassword } from '@api/validators/password_modifications.validators';

export const createPasswordModificationProcedure = procedure(
    'createPasswordModification',
    {} as {
        token: string;
        new_password: string;
        old_password: string;
    },
    async (params) => {
        const user_id = await usePrincipalUser();
        const token = params.token;
        const new_password = await validatePassword(params.new_password);
        const old_password = await validatePassword(params.old_password);

        const new_password_validated = await validateNewPassword(new_password, old_password);

        // TODO: Check why SQL statement display an error
        await sql`
            INSERT INTO pending_password_modifications (token, new_password, user_id)
            VALUES (${token}, ${new_password_validated}, ${user_id})
            ON CONFLICT (new_password) DO UPDATE SET token = ${token}
        `;

        return { message: 'ok' };
    },
);

export const deletePasswordModificationProcedure = procedure(
    'deletePasswordModification',
    {} as {
        token: string;
    },
    async (params) => {
        const user_id = await usePrincipalUser();
        const token = params.token;

        // TODO: Check why SQL statement display an error
        await sql`
            DELETE
            FROM pending_password_modifications
            WHERE token = ${token}
            AND user_id = ${user_id}
        `;

        return { message: 'ok' };
    },
);
