import { badRequest } from '@api/errors/bad-request.error';

export async function validateTag(tag?: string) {
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

export async function validateTags(tags?: string[]) {
    if (!tags) {
        throw badRequest();
    }
    if (tags.length < 3 || 10 < tags.length) {
        throw badRequest();
    }
    return Promise.all(tags.map(validateTag));
}

export async function validateMinimumCommonTags(minimum_common_tags?: number) {
    if (minimum_common_tags == null || minimum_common_tags < 0) {
        throw badRequest();
    }
    return minimum_common_tags;
}
