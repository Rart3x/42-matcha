import { badRequest } from '@api/errors/bad-request.error';

export async function validateMessage(message?: string) {
    if (typeof message !== 'string' || message.length === 0) {
        throw badRequest();
    }
    return message;
}
