// import { procedure } from '@api/lib/procedure';
// import { sql } from '@api/connections/database.connection';
// import { usePrincipalUser } from '@api/hooks/auth.hooks';
// import { validateAge } from '@api/validators/profile.validators';
// import { validateMinimumCommonTags } from '@api/validators/tag.validators';
// import { validateOrderBy, validateRating } from '@api/validators/browse.validator';
// import { validateLimit, validateOffset } from '@api/validators/page.validators';
//
// //TODO: implement location filter
// export const researchUsersProcedure = procedure(
//     'browseUsers',
//     {} as {
//         offset: number;
//         limit: number;
//         orderBy: 'age' | 'location' | 'fame_rating' | 'common_tags';
//         age?: number;
//         location?: string;
//         minimum_rating?: number;
//         minimum_common_tags?: number;
//     },
//     async (params) => {
//         const user_id = await usePrincipalUser();
//
//         const age = await validateAge(params.age).catch(() => null);
//         const orderBy = await validateOrderBy(params.orderBy);
//         // const location = params.location;
//         const minimum_rating = await validateRating(params.minimum_rating).catch(() => null);
//         const minimum_common_tags = await validateMinimumCommonTags(
//             params.minimum_common_tags,
//         ).catch(() => null);
//
//         const offset = await validateOffset(params.offset);
//         const limit = await validateLimit(params.limit);
//
//         const users = await sql<
//             {
//                 id: number;
//                 username: string;
//                 first_name: string;
//                 last_name: string;
//                 age: number;
//                 fame_rating: number;
//                 total_count: number;
//             }[]
//         >`
//             WITH
//                 principal_user AS (
//                     SELECT users.id, username, first_name, last_name, age, sexual_pref, gender, fame_rating,
//                            array_remove(ARRAY_AGG(tags.name), NULL) as tags
//                     FROM users
//                          LEFT JOIN users_tags ON users_tags.user_id = users.id
//                          LEFT JOIN tags ON tags.id = users_tags.tag_id
//                     WHERE users.id = ${user_id}
//                     GROUP BY users.id, username, first_name, last_name, age, sexual_pref, biography, gender, fame_rating
//                 ),
//                 common_tags AS (
//                     SELECT
//                         ut1.user_id AS other_user_id,
//                         COUNT(*) AS common_tags_count
//                     FROM users_tags ut1
//                     JOIN users_tags ut2
//                         ON ut1.tag_id = ut2.tag_id
//                     WHERE
//                         ut2.user_id = ${user_id} -- replace this with the actual principal user ID
//                         AND ut1.user_id != ${user_id} -- exclude the principal user themselves
//                     GROUP BY
//                         ut1.user_id
//                 ),
//                 age_gaps AS (
//                     SELECT
//                         users.id as other_user_id,
//                         ABS(principal_user.age - users.age) as age_gap
//                     FROM principal_user, users
//                     WHERE users.id != ${user_id}
//                 )
//                 SELECT
//                     users.id,
//                     users.username,
//                     users.first_name,
//                     users.last_name,
//                     users.age,
//                     users.fame_rating,
//                     COUNT(*) over () as total_count
//                 FROM principal_user, users
//                 LEFT JOIN common_tags
//                     ON users.id = common_tags.other_user_id
//                 LEFT JOIN age_gaps
//                     ON users.id = age_gaps.other_user_id
//                 WHERE
//                     users.id != ${user_id}
//                     -- filters out users depending on the filters set by the principal user
//                     AND CASE WHEN ${age}::integer IS NOT NULL -- either show users within a certain age range or within 5 years of the principal user's age
//                         THEN ${age} - 5 < users.age AND users.age < ${age} + 5
//                         ELSE age_gap < 5 END
//                     AND CASE WHEN principal_user.sexual_pref = 'any' -- if principal user is bisexual, show everyone
//                         THEN true
//                         ELSE principal_user.sexual_pref = users.gender END
//                     AND CASE WHEN ${minimum_rating}::integer IS NOT NULL
//                         THEN users.fame_rating >= ${minimum_rating}
//                         ELSE true END
//                     AND CASE WHEN ${minimum_common_tags}::integer IS NOT NULL
//                         THEN common_tags_count >= ${minimum_common_tags}
//                         ELSE true END
//                 ORDER BY
//                     CASE  -- order by the principal user's preference first (sets the order)
//                         WHEN ${orderBy} = 'age' THEN age_gap
//                         -- TODO: implement location filter
//                     END,
//                     CASE -- sets the direction of the order
//                         WHEN ${orderBy} = 'fame_rating' THEN users.fame_rating
//                         WHEN ${orderBy} = 'common_tags' THEN common_tags_count
//                     END DESC,
//                     common_tags_count DESC, users.fame_rating DESC, age_gap -- order by the most important filter first
//                 OFFSET ${offset}
//                 LIMIT ${limit}
//         `;
//
//         const total_count = users[0]?.total_count || 0;
//
//         return { users: users, total_count };
//     },
// );
