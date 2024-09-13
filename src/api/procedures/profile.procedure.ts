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
import { validateTags } from '@api/validators/tag.validators';

export type Profile = {
    username: string;
    first_name: string;
    last_name: string;
    age: number;
    sexual_pref: 'male' | 'female' | 'any';
    biography: string;
    gender: 'male' | 'female' | 'other';
    tags: string[];
};

export const getPrincipalProfileProcedure = procedure('getPrincipalProfile', async () => {
    const user_id = await usePrincipalUser();

    const [profile]: [Profile?] = await sql`
        SELECT username, first_name, last_name, age, sexual_pref, biography, gender, 
               array_remove(ARRAY_AGG(tags.name), NULL) as tags
        FROM users
            LEFT JOIN users_tags ON users_tags.user_id = users.id
            LEFT JOIN tags ON tags.id = users_tags.tag_id
        WHERE users.id = ${user_id}
        GROUP BY username, first_name, last_name, age, sexual_pref, biography, gender 
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
        const tags = validateTags(params.tags);

        const user = await sql.begin(async (sql) => {
            await sql`
                DELETE FROM users_tags
                WHERE user_id = ${user_id}
            `;

            for (const tag of tags) {
                await sql`
                    INSERT INTO tags (name)
                    VALUES (${tag})
                    ON CONFLICT (name) DO NOTHING
                    RETURNING id
                `;
                await sql`
                    INSERT INTO users_tags (user_id, tag_id)
                    SELECT ${user_id}, id
                    FROM tags
                    WHERE name = ${tag}
                    ON CONFLICT DO NOTHING
                `;
            }

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
                RETURNING id
            `;

            return user;
        });

        if (!user) {
            throw badRequest();
        }

        return { message: 'Profile updated successfully' };
    },
);
