const IS_PRODUCTION = process.env?.['NODE_ENV'] === 'production';
const IS_DEVELOPMENT = !IS_PRODUCTION;

export async function getLatLngFromIp(ip: string) {
    if (IS_DEVELOPMENT) {
        // Return a default location for development as the api.hackertarget.com service is rate limited to 50 requests per day
        return {
            lat: 45.65535637267172,
            lng: 0.15913728259653068,
        };
    }

    return fetch(`https://api.hackertarget.com/geoip/?q=${ip}&output=json"`)
        .then((response) => response.json())
        .then((data) => ({
            lat: data.latitude,
            lng: data.longitude,
        }));
}
