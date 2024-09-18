import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { validateLatitude, validateLongitude } from '@api/validators/location.validators';

export const upsertLocationProcedure = procedure(
    'upsertLocation',
    {} as {
        location?: {
            latitude: number;
            longitude: number;
        };
    },
    async (params) => {
        const principal_user_id = await usePrincipalUser();

        if (!params.location) {
            await sql`
                DELETE
                FROM locations
                WHERE user_id = ${principal_user_id}
            `;

            // TODO use geoip to get the location

            return { message: 'Location deleted' };
        }

        const latitude = await validateLatitude(params.location.latitude);
        const longitude = await validateLongitude(params.location.longitude);

        await sql`
            with upsert as (
                UPDATE locations
                    SET latitude = ${latitude}, longitude = ${longitude}, consented = true
                    WHERE user_id = ${principal_user_id})
            INSERT
            INTO locations (user_id, latitude, longitude, consented)
            VALUES (${principal_user_id}, ${latitude}, ${longitude}, true)
            ON CONFLICT (user_id) DO NOTHING;
        `;

        return { message: 'Location updated' };
    },
);

export const getPrincipalUserLocationProcedure = procedure('getPrincipalUserLocation', async () => {
    const principal_user_id = await usePrincipalUser();

    return await sql.begin(async (sql) => {
        const [location]: [
            {
                latitude: number;
                longitude: number;
            }?,
        ] = await sql`
            SELECT latitude, longitude
            FROM locations
            WHERE locations.user_id = ${principal_user_id}
        `;

        if (!location) {
            return { location: null };
        }

        return { location };
    });
});
