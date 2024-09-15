import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { validateAge } from '@api/validators/profile.validators';
import { validateMinimumCommonTags } from '@api/validators/tag.validators';
import { validateRating, validateOrderBy } from '@api/validators/browse.validator';

export const browseUsersProcedure = procedure(
    'browseUsers',
    {} as {
        orderBy: 'age' | 'location' | 'rating' | 'tag';
        age?: number;
        location?: string;
        minimum_rating?: number;
        minimum_common_tags?: number;
    },
    async (params) => {
        const user_id = await usePrincipalUser();

        const age = validateAge(params.age);
        const orderBy = validateOrderBy(params.orderBy);
        // const location = params.location;
        const minimum_rating = validateRating(params.minimum_rating);
        const minimum_common_tags = validateMinimumCommonTags(params.minimum_common_tags);

        const { users: users } = await sql.begin(async (sql) => {
            // -- Fetch Users depending on age, location, fame_rating, tags and ordered by params -- //
            // TODO: Add location on query

            const users = sql<
                {
                    id: number;
                    username: string;
                    first_name: string;
                    last_name: string;
                    age: number;
                    fame_rating: number;
                }[]
            >`
                WITH principal_user AS (
                    SELECT id, username, first_name, last_name, age, sexual_pref, gender, fame_rating,
                        array_remove(ARRAY_AGG(tags.name), NULL) as tags
                    FROM users
                        LEFT JOIN users_tags ON users_tags.user_id = users.id
                        LEFT JOIN tags ON tags.id = users_tags.tag_id
                    WHERE id = ${user_id}
                    GROUP BY username, first_name, last_name, age, sexual_pref, biography, gender, fame_rating
                )
                WITH common_tags AS (
                    SELECT 
                        ut1.user_id AS other_user_id, 
                        COUNT(*) AS common_tag_count
                    FROM 
                        users_tags ut1
                    JOIN 
                        users_tags ut2 
                    ON 
                        ut1.tag_id = ut2.tag_id
                    WHERE 
                        ut2.user_id = principal_user.id -- replace this with the actual principal user ID
                        AND ut1.user_id != principal_user.id -- exclude the principal user themselves
                    GROUP BY 
                        ut1.user_id
                )
                SELECT
                    u.id,
                    u.username,
                    u.first_name,
                    u.last_name,
                    u.fame_rating,
                    COALESCE(${age}, principal_user.age) as ref_age,
                    COALESCE(${minimum_rating}, principal_user.fame_rating - 2) as ref_minimum_rating,
                    COALESCE(${minimum_common_tags}, 3) AS ref_minimum_common_tags
                FROM
                    users u
                    LEFT JOIN common_tags
                    ON u.id = common_tags.other_user_id
                WHERE
                    u.age BETWEEN (ref_age - 5) AND (ref_age + 5)
                    AND u.fame_rating BETWEEN (ref_rating - 1) AND (ref_rating + 1)
                    AND common_tags_count >= ref_minimum_common_tags
                GROUP BY
                    u.id,
                    u.username,
                    u.first_name,
                    u.last_name,
                    u.age,
                    u.fame_rating
                ORDER BY
                    ${orderBy ? `u.${orderBy}` : `common_tags_count`} DESC
                LIMIT 10;
            `;
            return { users };
        });
        return users;
    },
);
