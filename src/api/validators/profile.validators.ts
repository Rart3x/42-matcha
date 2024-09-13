import { badRequest } from '@api/errors/bad-request.error';

export function validateAge(age?: string): number {
    if (!age) {
        throw badRequest();
    }
    if (!/^\d+$/.test(age)) {
        throw badRequest();
    }

    const parsed = parseInt(age, 10);

    if (isNaN(parsed)) {
        return 0;
    }
    if (parsed < 18 || 120 < parsed) {
        throw badRequest();
    }
    return parsed;
}

export function validateSexualPref(sexual_pref?: string) {
    if (!sexual_pref) {
        throw badRequest();
    }
    if (!['male', 'female', 'any'].includes(sexual_pref)) {
        throw badRequest();
    }
    return sexual_pref;
}

export function validateBiography(biography?: string) {
    if (!biography) {
        throw badRequest();
    }
    if (biography.length > 500) {
        throw badRequest();
    }
    return biography;
}

export function validateGender(gender?: string) {
    if (!gender) {
        throw badRequest();
    }
    if (!['male', 'female', 'other'].includes(gender)) {
        throw badRequest();
    }
    return gender as 'male' | 'female' | 'other';
}
