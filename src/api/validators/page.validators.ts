import { badRequest } from '@api/errors/bad-request.error';

export async function offsetValidator(offset?: number) {
    if (offset === undefined) {
        throw badRequest();
    }
    if (offset < 0 && offset > 50) {
        throw badRequest();
    }
    return offset;
}

export async function limitValidator(limit?: number) {
    if (limit === undefined) {
        throw badRequest();
    }
    if (limit < 0 && limit > 50) {
        throw badRequest();
    }
    return limit;
}
