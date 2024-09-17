import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { validateLatitude, validateLongitude } from '@api/validators/location.validators';
import { validateLimit, validateOffset } from '@api/validators/page.validators';

export const createLocationProcedure = procedure(
    'createLocation',
    {} as {
        latitude: number;
        longitude: number;
    },
    async (params) => {
        const principal_user_id = await usePrincipalUser();

        const latitude = await validateLatitude(params.latitude);
        const longitude = await validateLongitude(params.longitude);

        return await sql`
            INSERT INTO locations (user_id, latitude, longitude)
            VALUES (${principal_user_id}, ${latitude}, ${longitude})
        `;
    },
);

export const getLocationsByUserIdProcedure = procedure(
    'getLocationsByUserId',
    {} as {
        offset: number;
        limit: number;
    },
    async (params) => {
        const principal_user_id = await usePrincipalUser();

        const offset = await validateOffset(params.offset);
        const limit = await validateLimit(params.limit);

        return await sql.begin(async (sql) => {
            const locations = await sql<
                {
                    latitude: number;
                    longitude: number;
                }[]
            >`
                SELECT latitude, longitude
                FROM user, locations
                LEFT JOIN users ON users.id = locations.user_id
                WHERE locations.user_id = ${principal_user_id}
                OFFSET ${offset} LIMIT ${limit}
            `;
            return { locations };
        });
    },
);
