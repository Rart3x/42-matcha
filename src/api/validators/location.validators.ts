import { badRequest } from '@api/errors/bad-request.error';

export async function validateLatitude(latitude?: number) {
    if (typeof latitude !== 'number' || isNaN(latitude)) {
        throw badRequest();
    }
    if (latitude < -90 || latitude > 90) {
        throw badRequest();
    }
    return latitude;
}

export async function validateLongitude(longitude?: number) {
    if (typeof longitude !== 'number' || isNaN(longitude)) {
        throw badRequest();
    }
    if (longitude < -180 || longitude > 180) {
        throw badRequest();
    }
    return longitude;
}

export async function validateDistance(distance?: number) {
    if (typeof distance !== 'number' || isNaN(distance)) {
        throw badRequest();
    }
    if (distance < 0) {
        throw badRequest();
    }
    if (!Number.isInteger(distance)) {
        throw badRequest();
    }
    return distance;
}
