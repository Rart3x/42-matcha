import { BaseApiError } from '../lib/base-api-error';

export class BadRequestError extends BaseApiError {
    constructor() {
        super('Bad Request', 400);
    }
}

export function badRequest() {
    return new BadRequestError();
}
