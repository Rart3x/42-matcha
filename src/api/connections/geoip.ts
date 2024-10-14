import { validateLatitude, validateLongitude } from '@api/validators/location.validators';

const IS_PRODUCTION = process.env?.['NODE_ENV'] === 'production';
const IS_DEVELOPMENT = !IS_PRODUCTION;

// during assessment, the application is served on a local network
// so we can't use the client's ip address, we'll use a mocked ip address instead
const MOCKED_IP = '23.90.210.20';

const IS_ASSESSMENT = process.env?.['APP_IS_ASSESSMENT'] === 'true';

export async function getLatLngFromIp(ip: string) {
    if (IS_DEVELOPMENT) {
        // Return a default location for development as the api.hackertarget.com service is rate limited to 50 requests per day
        return {
            lat: 45.65535637267172,
            lng: 0.15913728259653068,
        };
    }

    const ipToUse = IS_ASSESSMENT ? MOCKED_IP : ip;

    return fetch(`http://ip-api.com/json/${ipToUse}`)
        .then((response) => response.json())
        .then(async (data) => ({
            lat: await validateLatitude(data.lat),
            lng: await validateLongitude(data.lon),
        }))
        .catch((e) => {
            console.log(`Error fetching location from ip: ${ipToUse}`, e);

            return null;
        });
}
