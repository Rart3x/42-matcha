import { badRequest } from '@api/errors/bad-request.error';

export function validateAge(age?: number): number {
    if (!age) {
        throw badRequest();
    }
    if (isNaN(age)) {
        return 0;
    }
    // test if integer
    if (age % 1 !== 0) {
        throw badRequest();
    }
    if (age < 18 || 120 < age) {
        throw badRequest();
    }
    return age;
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
