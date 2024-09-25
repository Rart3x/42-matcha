import { badRequest } from '@api/errors/bad-request.error';

export async function validateOffset(offset?: number) {
    if (typeof offset !== 'number') {
        throw badRequest();
    }
    if (offset < 0 && offset > 50) {
        throw badRequest();
    }
    return offset;
}

export async function validateLimit(limit?: number) {
    if (typeof limit !== 'number') {
        throw badRequest();
    }
    if (limit < 0 && limit > 50) {
        throw badRequest();
    }
    return limit;
}
