import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { validateTags } from '@api/validators/tag.validators';
import { validateOrderBy, validateRating } from '@api/validators/browse.validator';
import { validateLimit, validateOffset } from '@api/validators/page.validators';
import { validateDistance } from '@api/validators/location.validators';
import { validateAgeGap } from '@api/validators/profile.validators';

export const searchUsersProcedure = procedure(
    'searchUsers',
    {} as {
        maximum_age_gap?: number;
        maximum_fame_rating_gap?: number;
        maximum_distance?: number;
        required_tags?: string[];
        orderBy: 'age' | 'distance' | 'fame_rating' | 'common_tags';
        offset: number;
        limit: number;
    },
    async (params) => {
        const principal_user_id = await usePrincipalUser();

        const maximum_age_gap = await validateAgeGap(params.maximum_age_gap).catch(() => null);
        const maximum_fame_rating_gap = await validateRating(params.maximum_fame_rating_gap).catch(
            () => null,
        );
        const maximum_distance = await validateDistance(params.maximum_distance).catch(() => null);
        const required_tags = await validateTags(params.required_tags).catch(() => null);
        const orderBy = await validateOrderBy(params.orderBy);

        const offset = await validateOffset(params.offset);
        const limit = await validateLimit(params.limit);

        const users = await sql<
            {
                id: number;
                username: string;
                first_name: string;
                last_name: string;
                age: number;
                fame_rating: number;
                bio: string;
                gender: string;
            }[]
        >`
        SELECT
            users.id,
            users.username,
            users.first_name,
            users.last_name,
            users.age,
            users.fame_rating,
            users.biography as bio,
            users.gender
        FROM search_users(${principal_user_id}, ${maximum_age_gap}, ${maximum_fame_rating_gap}, ${maximum_distance},
                          ${required_tags ?? []}, ${orderBy}) AS users
        OFFSET ${offset} LIMIT ${limit}
    `;

        return { users };
    },
);
