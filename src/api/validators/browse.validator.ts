import { badRequest } from '@api/errors/bad-request.error';

export async function validateRating(rating?: number) {
    if (rating == null || rating < 0 || rating > 5) {
        throw badRequest();
    }
    return rating;
}

export async function validateOrderBy(orderBy?: string) {
    if (!orderBy || !['age', 'location', 'fame_rating', 'common_tags'].includes(orderBy)) {
        throw badRequest();
    }
    return orderBy as 'age' | 'location' | 'rating' | 'tag';
}
