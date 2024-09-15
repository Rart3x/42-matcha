import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { validateAge } from '@api/validators/profile.validators';
import { validateMinimumCommonTags } from '@api/validators/tag.validators';
import { validateOrderBy, validateRating } from '@api/validators/browse.validator';

//TODO: implement location filter
export const browseUsersProcedure = procedure(
    'browseUsers',
    {} as {
        orderBy: 'age' | 'location' | 'fame_rating' | 'common_tags';
        age?: number;
        location?: string;
        minimum_rating?: number;
        minimum_common_tags?: number;
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

        const users = await sql<
            {
                id: number;
                username: string;
                first_name: string;
                last_name: string;
                age: number;
                fame_rating: number;
            }[]
        >`
            WITH 
                principal_user AS (
                    SELECT users.id, username, first_name, last_name, age, sexual_pref, gender, fame_rating,
                           array_remove(ARRAY_AGG(tags.name), NULL) as tags
                    FROM users
                         LEFT JOIN users_tags ON users_tags.user_id = users.id
                         LEFT JOIN tags ON tags.id = users_tags.tag_id
                    WHERE users.id = ${user_id}
                    GROUP BY users.id, username, first_name, last_name, age, sexual_pref, biography, gender, fame_rating
                ),
                common_tags AS (
                    SELECT
                        ut1.user_id AS other_user_id,
                        COUNT(*) AS count
                    FROM users_tags ut1
                    JOIN users_tags ut2
                        ON ut1.tag_id = ut2.tag_id
                    WHERE
                        ut2.user_id = ${user_id} -- replace this with the actual principal user ID
                        AND ut1.user_id != ${user_id} -- exclude the principal user themselves
                    GROUP BY
                        ut1.user_id
                ),
                filters AS (
                    SELECT
                    COALESCE(${age}, principal_user.age) as age,
                    COALESCE(${minimum_rating}, principal_user.fame_rating - 2) as minimum_rating,
                    COALESCE(${minimum_common_tags}, 3) AS minimum_common_tags
                    FROM principal_user
                )
                SELECT
                    users.id,
                    users.username,
                    users.first_name,
                    users.last_name,
                    users.fame_rating,
                    COUNT(common_tags.count) as common_tags
                FROM filters, users 
                LEFT JOIN common_tags
                    ON users.id = common_tags.other_user_id
                WHERE
                    users.age BETWEEN (filters.age - 5) AND (filters.age + 5)
                    AND users.fame_rating >= filters.minimum_rating
                    AND common_tags.count >= filters.minimum_common_tags
                GROUP BY users.id, users.username, users.first_name, users.last_name, users.fame_rating
                ORDER BY ${sql(orderBy)} DESC
                LIMIT 10;
        `;

        return { users };
    },
);
