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

        const [profile]: [
            {
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
                blocked_by_principal: boolean;
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

        FROM users
            -- Get the user's tags
            LEFT JOIN users_tags
                ON users_tags.user_id = users.id
            LEFT JOIN tags
                ON tags.id = users_tags.tag_id

            -- Whether liked by principal
            LEFT JOIN likes AS liked_by_principal
                ON liked_by_principal.liked_user_id = users.id AND liked_by_principal.liker_user_id = ${principal_id}
            -- Whether likes principal
            LEFT JOIN likes AS likes_principal
                ON likes_principal.liked_user_id = ${principal_id} AND likes_principal.liker_user_id = users.id

            -- Whether blocked by principal
            LEFT JOIN blocks AS blocked_by_principal
                ON blocked_by_principal.blocked_user_id = users.id AND
                   blocked_by_principal.blocker_user_id = ${principal_id}
            -- Whether principal is blocked by user
            LEFT JOIN blocks AS blocks_principal
                ON blocks_principal.blocked_user_id = ${principal_id} AND blocks_principal.blocker_user_id = users.id

            -- Whether principal is reported by user
            LEFT JOIN fake_user_reports AS reported_by_principal
                ON reported_by_principal.reported_user_id = ${principal_id} AND
                   reported_by_principal.reporter_user_id = users.id
            -- Whether user is reported by principal
            LEFT JOIN fake_user_reports AS reported_principal
                ON reported_principal.reported_user_id = users.id AND
                   reported_principal.reporter_user_id = ${principal_id}

        WHERE
              users.id = ${user_id}
              -- do not show blocked users nor users who blocked the principal
          AND blocks_principal.blocked_user_id IS NULL
          AND blocked_by_principal.blocked_user_id IS NULL
              -- do not show reported users nor users who reported the principal
          AND reported_principal.reported_user_id IS NULL
          AND reported_by_principal.reported_user_id IS NULL

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

        return profile;
    },
);
