import { badRequest } from '@api/errors/bad-request.error';

export async function validateUserId(user_id?: number) {
    if (typeof user_id !== 'number') {
        throw badRequest();
    }
    if (isNaN(user_id)) {
        throw badRequest();
    }
    if (user_id < 0) {
        throw badRequest();
    }
    return user_id;
}

export async function validateAge(age?: number) {
    if (typeof age !== 'number') {
        throw badRequest();
    }
    if (isNaN(age)) {
        throw badRequest();
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

export async function validateSexualPref(sexual_pref?: string) {
    if (typeof sexual_pref !== 'string') {
        throw badRequest();
    }
    if (!['male', 'female', 'any'].includes(sexual_pref)) {
        throw badRequest();
    }
    return sexual_pref as 'male' | 'female' | 'any';
}

export async function validateBiography(biography?: string) {
    if (typeof biography !== 'string') {
        throw badRequest();
    }
    if (biography.length > 500) {
        throw badRequest();
    }
    return biography;
}

export async function validateGender(gender?: string) {
    if (typeof gender !== 'string') {
        throw badRequest();
    }
    if (!['male', 'female', 'other'].includes(gender)) {
        throw badRequest();
    }
    return gender as 'male' | 'female' | 'other';
}
