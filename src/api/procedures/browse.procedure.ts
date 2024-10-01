import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { validateAge } from '@api/validators/profile.validators';
import { validateMinimumCommonTags } from '@api/validators/tag.validators';
import { validateOrderBy, validateRating } from '@api/validators/browse.validator';
import { validateLimit, validateOffset } from '@api/validators/page.validators';
import { validateDistance } from '@api/validators/location.validators';

//TODO: implement location filter
export const browseUsersProcedure = procedure(
    'browseUsers',
    {} as {
        offset: number;
        limit: number;
        orderBy: 'age' | 'location' | 'fame_rating' | 'common_tags' | 'distance';
        age?: number;
        location?: string;
        minimum_rating?: number;
        minimum_common_tags?: number;
        maximum_distance?: number;
    },
    async (params) => {
        const user_id = await usePrincipalUser();

        const age = await validateAge(params.age).catch(() => null);
        const orderBy = await validateOrderBy(params.orderBy);
        // const location = params.location;
        const minimum_rating = await validateRating(params.minimum_rating).catch(() => null);
        const minimum_common_tags = await validateMinimumCommonTags(
            params.minimum_common_tags,
        ).catch(() => null);

        const maximum_distance = await validateDistance(params.maximum_distance).catch(() => null);

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
                total_count: number;
                biography: string;
            }[]
        >`
        SELECT
            users.id,
            users.username,
            users.first_name,
            users.last_name,
            users.biography,
            users.age,
            users.fame_rating
        FROM browse_users(${user_id}, ${age}, ${minimum_rating}, ${minimum_common_tags}, ${maximum_distance},
                          ${orderBy}) AS users
        OFFSET ${offset} LIMIT ${limit}
        ;`;

        return { users: users };
    },
);
