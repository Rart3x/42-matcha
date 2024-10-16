import { badRequest } from '@api/errors/bad-request.error';

export async function validateNewPassword(newPass?: string, password?: string) {
    if (typeof password !== 'string') {
        throw badRequest();
    }

    if (newPass === password) {
        throw badRequest();
    }

    return newPass;
}
