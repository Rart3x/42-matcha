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
import { validateTag, validateTags } from '@api/validators/tag.validators';
import { limitValidator, offsetValidator } from '@api/validators/page.validators';

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

export const getProfileByUsernameProcedure = procedure(
    'getProfileByUsername',
    {} as { username: string },
    async (params) => {
        const username = await validateUsername(params.username);

        const [profile]: [Profile?] = await sql`
            SELECT username, first_name, last_name, age, sexual_pref, biography, gender,
                   array_remove(ARRAY_AGG(tags.name), NULL) as tags
            FROM users
                LEFT JOIN users_tags ON users_tags.user_id = users.id
                LEFT JOIN tags ON tags.id = users_tags.tag_id
            WHERE username = ${username}
            GROUP BY username, first_name, last_name, age, sexual_pref, biography, gender
        `;

        if (!profile) {
            throw badRequest();
        }

        return profile;
    },
);

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

export const getExistingTagsProcedure = procedure(
    'getExistingTags',
    {} as {
        tag: string;
        offset: number;
        limit: number;
    },
    async (params) => {
        const tag = await validateTag(params.tag);
        const offset = await offsetValidator(params.offset);
        const limit = await limitValidator(params.limit);

        const existingTags = await sql<{ name: string; nbr: number }[]>`
            SELECT name, COUNT(*) OVER () as nbr
            FROM tags
            WHERE name LIKE ${tag + '%'}
            GROUP BY name
            ORDER BY name
            OFFSET ${offset}
            LIMIT ${limit}
        `;

        const count = existingTags?.[0]?.nbr ?? 0;

        return { count, page: offset / limit + 1, tags: existingTags.map((tag) => tag.name) };
    },
);

export const patchPrincipalProfileProcedure = procedure(
    'patchPrincipalProfile',
    {} as Profile,
    async (params) => {
        const user_id = await usePrincipalUser();

        const username = await validateUsername(params.username);
        const first_name = await validateName(params.first_name);
        const last_name = await validateName(params.last_name);
        const age = await validateAge(params.age);
        const sexual_pref = await validateSexualPref(params.sexual_pref);
        const biography = await validateBiography(params.biography);
        const gender = await validateGender(params.gender);
        const tags = await validateTags(params.tags);

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
