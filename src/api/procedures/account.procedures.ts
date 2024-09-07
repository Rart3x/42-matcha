import { procedure } from '@api/lib/procedure';
import { err, ok, safeTry } from '@api/lib/result';
import { sql } from '@api/connections/database';

export const createAccountProcedure = procedure(
    'createAccount',
    {} as {
        email: string;
        username: string;
        password: string;
        firstName: string;
        lastName: string;
    },
    ({ email, username, password, firstName, lastName }) => {
        return safeTry(async function* () {
            // validate format

            const registrationToken = await sql``;

            if (!registrationToken) {
                return err('Failed to create account');
            }

            return ok({ message: 'Registration successful' });
        });
    },
);
