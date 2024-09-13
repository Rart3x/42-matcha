import { procedure } from '@api/lib/procedure';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { sql } from '@api/connections/database.connection';
import { badRequest } from '@api/errors/bad-request.error';
import { validateName, validateUsername } from '@api/validators/account.validators';
import {
    validateAge,
    validateBiography,
    validateGender,
    validateSexualPref,
} from '@api/validators/profile.validators';

export type Profile = {
    username: string;
    first_name: string;
    last_name: string;
    age: string;
    sexual_pref: 'male' | 'female' | 'any';
    biography: string;
    gender: 'male' | 'female' | 'other';
};

export const getPrincipalProfileProcedure = procedure('getPrincipalProfile', async () => {
    const user_id = await usePrincipalUser();

    const [profile]: [Profile?] = await sql`
        SELECT username, first_name, last_name, age, sexual_pref, biography, gender
        FROM users
        WHERE id = ${user_id}
    `;

    if (!profile) {
        throw badRequest();
    }

    return profile;
});

export const patchPrincipalProfileProcedure = procedure(
    'patchPrincipalProfile',
    {} as Profile,
    async (params) => {
        const user_id = await usePrincipalUser();

        const username = validateUsername(params.username);
        const first_name = validateName(params.first_name);
        const last_name = validateName(params.last_name);
        const age = validateAge(params.age);
        const sexual_pref = validateSexualPref(params.sexual_pref);
        const biography = validateBiography(params.biography);
        const gender = validateGender(params.gender);

        const [user]: [{ id: string }?] = await sql`
            UPDATE users
            SET username = ${username},
                first_name = ${first_name},
                last_name = ${last_name},
                age = ${age},
                sexual_pref = ${sexual_pref},
                biography = ${biography},
                gender = ${gender}
            WHERE id = ${user_id}
            returning id
        `;

        if (!user) {
            throw badRequest();
        }

        return { message: 'Profile updated successfully' };
    },
);
