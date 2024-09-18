import { procedure } from '@api/lib/procedure';
import { sql } from '@api/connections/database.connection';
import { usePrincipalUser } from '@api/hooks/auth.hooks';
import { validateLatitude, validateLongitude } from '@api/validators/location.validators';
import { useGetIp } from '@api/hooks/ip.hooks';
import { getLatLngFromIp } from '@api/connections/geoip';

// during assessment, the application is served on a local network
// so we can't use the client's ip address, we'll use a mocked ip address instead
const MOCKED_IP = '23.90.210.20';

const IS_ASSESSMENT = process.env?.['APP_IS_ASSESSMENT'] === 'true';

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
        const ip = IS_ASSESSMENT ? MOCKED_IP : useGetIp();

        if (!params.location) {
            await sql`
                DELETE
                FROM locations
                WHERE user_id = ${principal_user_id}
            `;

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
                            SET latitude = ${latitude}, longitude = ${longitude}, consented = true
                            WHERE user_id = ${principal_user_id})
                    INSERT
                    INTO locations (user_id, latitude, longitude, consented)
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
