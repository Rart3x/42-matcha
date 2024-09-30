import { procedure } from '@api/lib/procedure';
import { validateTag } from '@api/validators/tag.validators';
import { validateLimit, validateOffset } from '@api/validators/page.validators';
import { sql } from '@api/connections/database.connection';

export const getExistingTagsProcedure = procedure(
    'getExistingTags',
    {} as {
        tag: string;
        offset: number;
        limit: number;
    },
    async (params) => {
        const tag = await validateTag(params.tag);
        const offset = await validateOffset(params.offset);
        const limit = await validateLimit(params.limit);

        const existingTags = await sql<{ name: string; nbr: number }[]>`
            SELECT name, COUNT(*) OVER () as nbr
            FROM tags
            WHERE name ILIKE ${tag + '%'}
            GROUP BY name
            ORDER BY name
            OFFSET ${offset}
            LIMIT ${limit}
        `;

        const count = existingTags?.[0]?.nbr ?? 0;

        return { count, page: offset / limit + 1, tags: existingTags.map((tag) => tag.name) };
    },
);
