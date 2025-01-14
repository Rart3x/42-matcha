import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { validateLatitude, validateLongitude } from '@api/validators/location.validators';
import { useGetIp } from '@api/hooks/ip.hooks';
import { getLatLngFromIp } from '@api/connections/geoip';

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
        const ip = useGetIp();

        if (params.location) {
            const latitude = await validateLatitude(params.location.latitude);
            const longitude = await validateLongitude(params.location.longitude);

            await sql`
            with upsert as (
                UPDATE locations
                    SET latitude = ${latitude}, longitude = ${longitude}, is_consented = true
                    WHERE user_id = ${principal_user_id})
                INSERT
            INTO locations (user_id, latitude, longitude, is_consented)
            VALUES (${principal_user_id}, ${latitude}, ${longitude}, true)
            ON CONFLICT (user_id) DO NOTHING;
        `;

            return { message: 'Location updated' };
        }

        if (ip) {
            const location = await getLatLngFromIp(ip);

            if (!location) {
                // delete
                await sql`
                DELETE
                FROM locations
                WHERE user_id = ${principal_user_id}
            `;

                return { message: 'Location deleted' };
            }

            const latitude = location.lat;
            const longitude = location.lng;

            console.log(`fetched position from geoip service: ${latitude}, ${longitude}`);

            await sql`
            with upsert as (
                UPDATE locations
                    SET latitude = ${latitude}, longitude = ${longitude}, is_consented = false
                    WHERE user_id = ${principal_user_id})
            INSERT
            INTO locations (user_id, latitude, longitude, is_consented)
            VALUES (${principal_user_id}, ${latitude}, ${longitude}, true)
            ON CONFLICT (user_id) DO NOTHING;
        `;
        } else {
            // delete
            await sql`
            DELETE
            FROM locations
            WHERE user_id = ${principal_user_id}
        `;
        }

        return { message: 'Location deleted' };
    },
);

export const getPrincipalUserLocationProcedure = procedure('getPrincipalUserLocation', async () => {
    const principal_user_id = await usePrincipalUser();

    return await sql.begin(async (sql) => {
        const [location]: [
            {
                latitude: number;
                longitude: number;
                is_consented: boolean;
            }?,
        ] = await sql`
            SELECT latitude, longitude, is_consented
            FROM locations
            WHERE locations.user_id = ${principal_user_id}
        `;

        if (!location || !location.is_consented) {
            return { location: null };
        }

        const { latitude, longitude } = location;

        return { location: { latitude, longitude } };
    });
});
