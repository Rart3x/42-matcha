import { badRequest } from '@api/errors/bad-request.error';

export function validateTag(tag?: string) {
    if (!tag) {
        throw badRequest();
    }
    if (20 < tag.length) {
        throw badRequest();
    }
    if (!/^[a-z0-9-]+$/i.test(tag)) {
        throw badRequest();
    }
    return tag;
}

export function validateTags(tags?: string[]) {
    if (!tags) {
        throw badRequest();
    }
    if (tags.length < 3 || 10 < tags.length) {
        throw badRequest();
    }
    return tags.map(validateTag);
}
