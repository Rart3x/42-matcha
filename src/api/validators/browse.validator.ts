import { badRequest } from '@api/errors/bad-request.error';

export function validateRating(rating: number | undefined): number {
    if (rating == null || rating < 0 || rating > 5) {
        throw badRequest();
    }
    return rating;
}

export function validateOrderBy(orderBy: string | undefined): string {
    if (!orderBy || !['age', 'location', 'rating', 'tag'].includes(orderBy)) {
        throw badRequest();
    }
    return orderBy;
}
