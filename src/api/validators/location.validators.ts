import { badRequest } from '@api/errors/bad-request.error';

export async function validateLatitude(latitude?: number) {
    if (latitude == null || latitude < -90 || latitude > 90) {
        throw badRequest();
    }
    return latitude;
}

export async function validateLongitude(longitude?: number) {
    if (longitude == null || longitude < -180 || longitude > 180) {
        throw badRequest();
    }
    return longitude;
}
