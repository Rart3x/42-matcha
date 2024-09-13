import { badRequest } from '@api/errors/bad-request.error';

export function offsetValidator(offset?: number): number {
    if (offset === undefined) {
        throw badRequest();
    }
    if (offset < 0) {
        throw new Error('Offset must be a positive number');
    }
    return offset;
}

export function limitValidator(limit?: number): number {
    if (limit === undefined) {
        throw badRequest();
    }
    if (limit < 0) {
        throw new Error('Limit must be a positive number');
    }
    return limit;
}
