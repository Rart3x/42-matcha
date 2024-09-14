import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { limitValidator, offsetValidator } from '@api/validators/page.validators';
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
        const location = params.location;
        const rating = params.rating;
        const tags = params.tags;

        const { users: users } = await sql.begin(async (sql) => {
            // -- Fetch Principal User --  //
            const user = sql`
                SELECT *
                FROM tags, users, users_tags
                WHERE users.id = users_tags.user_id
                AND tags.id = users_tags.tag_id
                AND users.id = ${user_id}
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
                SELECT users.id, users.username, users.first_name, users.last_name, users.age, users.fame_rating
                FROM users
                WHERE ${age ? sql`AND users.age BETWEEN ${age - 5} AND ${age + 5}` : sql``}
                ${rating ? sql`AND users.fame_rating >= ${rating}` : sql``}
                ${tags ? sql`AND tags.name IN (${tags})` : sql``}
                ORDER BY ${orderBy} DESC
                LIMIT 10
            `;

            return { users };
        });
        return users;
    },
);
