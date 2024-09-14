import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { badRequest } from '@api/errors/bad-request.error';
import { validateAge } from '@api/validators/profile.validators';

export const browseUsersProcedure = procedure(
    'browseUsers',
    {} as {
        orderBy: 'age' | 'location' | 'rating' | 'tag';
        age?: number;
        location?: string;
        rating?: number;
        tags?: string[];
    },
    async (params) => {
        const user_id = await usePrincipalUser();

        if (!params.orderBy || !['age', 'location', 'rating', 'tag'].includes(params.orderBy)) {
            throw badRequest();
        }

        const age = validateAge(params.age);
        const orderBy = params.orderBy;
        // const location = params.location;
        const rating = params.rating;
        const tags = params.tags;

        const { users: users } = await sql.begin(async (sql) => {
            const user = sql`
                SELECT *
                FROM tags t, 
                     users u, 
                     users_tags ut
                WHERE u.id = ut.user_id
                AND t.id = ut.tag_id
                AND u.id = ${user_id}
            `;

            if (!user) {
                throw badRequest();
            }

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
                SELECT
                    u.id,
                    u.username,
                    u.first_name,
                    u.last_name,
                    u.age,
                    u.fame_rating,
                    COUNT(DISTINCT t.id) AS common_tags_count
                FROM
                    users u
                        LEFT JOIN
                    users_tags ut ON u.id = ut.user_id
                        LEFT JOIN
                    tags t ON ut.tag_id = t.id
                WHERE
                    ${age ? `u.age BETWEEN ${age - 5} AND ${age + 5}` : ''}
                    ${rating ? `u.fame_rating >= ${rating}` : ''}
                    ${tags ? `t.name IN (${tags.map((t) => `$${t}`).join(',')})` : ''}
                GROUP BY
                    u.id, u.username, u.first_name, u.last_name, u.age, u.fame_rating
                ORDER BY
                    ${orderBy}
                LIMIT 10;
            `;
            return { users };
        });
        return users;
    },
);
