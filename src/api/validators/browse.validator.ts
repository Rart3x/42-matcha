import { badRequest } from '@api/errors/bad-request.error';

export async function validateRating(rating?: number) {
    if (typeof rating !== 'number') {
        throw badRequest();
    }
    return rating;
}

export async function validateOrderBy(orderBy?: string) {
    if (typeof orderBy !== 'string') {
        throw badRequest();
    }
    if (!orderBy || !['age', 'location', 'fame_rating', 'common_tags'].includes(orderBy)) {
        throw badRequest();
    }
    return orderBy as 'age' | 'location' | 'fame_rating' | 'tag';
}
