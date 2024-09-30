import { procedure } from '@api/lib/procedure';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { sql } from '@api/connections/database.connection';
import { badRequest } from '@api/errors/bad-request.error';
import { validateUserId } from '@api/validators/profile.validators';

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

/**
 * Get a user's profile by their user ID.
 * @note The profile returned is intended to be viewed by other users.
 */
export const getProfileByIdProcedure = procedure(
    'getProfileById',
    {} as { user_id: number },
    async (params) => {
        const principal_id = await usePrincipalUser();

        const user_id = await validateUserId(params.user_id);

        return await sql.begin(async (sql) => {
            const [profile]: [
                {
                    id: number;
                    username: string;
                    first_name: string;
                    last_name: string;
                    age: number;
                    sexual_pref: 'male' | 'female' | 'any';
                    biography: string;
                    gender: 'male' | 'female' | 'other';
                    fame_rating: number;
                    likes_principal: boolean;
                    liked_by_principal: boolean;
                    tags: string[];
                }?,
            ] = await sql`
            SELECT
                users.id,
                users.username,
                users.first_name,
                users.last_name,
                users.age,
                users.sexual_pref,
                users.biography,
                users.gender,
                users.fame_rating,
                likes_principal.liker_user_id IS NOT NULL    AS likes_principal,
                liked_by_principal.liker_user_id IS NOT NULL AS liked_by_principal,
                ARRAY_REMOVE(ARRAY_AGG(tags.name), NULL)     AS tags

            FROM reachable_users(${principal_id}) AS users
                -- Get the user's tags
                LEFT JOIN users_tags
                    ON users_tags.user_id = users.id
                LEFT JOIN tags
                    ON tags.id = users_tags.tag_id

                -- Whether liked by principal
                LEFT JOIN likes AS liked_by_principal
                    ON liked_by_principal.liked_user_id = users.id AND
                       liked_by_principal.liker_user_id = ${principal_id}
                -- Whether likes principal
                LEFT JOIN likes AS likes_principal
                    ON likes_principal.liked_user_id = ${principal_id} AND likes_principal.liker_user_id = users.id

            WHERE
                users.id = ${user_id}

            GROUP BY
                users.id,
                users.username,
                users.first_name,
                users.last_name,
                users.age,
                users.sexual_pref,
                users.biography,
                users.gender,
                users.fame_rating,
                likes_principal,
                liked_by_principal
            ;`;

            if (!profile) {
                throw badRequest();
            }

            // Remove past visit if any
            await sql`
            DELETE
            FROM visits
            WHERE
                  visiter_user_id = ${principal_id}
              AND visited_user_id = ${user_id}
            ;`;

            // Record the visit as a retrieval of the profile is considered a visit
            await sql`
            INSERT INTO
                visits (visiter_user_id, visited_user_id)
            VALUES
                (${principal_id}, ${user_id})
            ;`;

            return profile;
        });
    },
);
