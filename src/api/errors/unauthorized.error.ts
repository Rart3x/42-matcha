import { BaseApiError } from '@api/lib/base-api-error';

/**
 * Unauthorized error.
 */
export class UnauthorizedError extends BaseApiError {
    constructor() {
        super('Unauthorized', 401);
    }
}

export function unauthorized() {
    return new UnauthorizedError();
}
