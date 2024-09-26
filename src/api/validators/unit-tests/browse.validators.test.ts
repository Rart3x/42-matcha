import { expect, test } from 'vitest';
import { validateRating, validateOrderBy } from '@api/validators/browse.validator';

// -- RATING NAN TESTS -- //
test('[INVALID] [RATING] [ISNAN] : NaN', async () => {
    await expect(validateRating(NaN)).rejects.toThrow();
});

// -- RATING VALUE TESTS -- //
test('[VALID] [RATING] [ZERO] : 0', async () => {
    expect(await validateRating(0)).toEqual(0);
});

test('[VALID] [RATING] [FIVE] : 5', async () => {
    expect(await validateRating(5)).toEqual(5);
});

// -- ORDER BY VALUE TESTS -- //
test('[VALID] [ORDERBY] [AGE] : "age"', async () => {
    expect(await validateOrderBy('age')).toEqual('age');
});

test('[VALID] [ORDERBY] [LOCATION] : "location"', async () => {
    expect(await validateOrderBy('location')).toEqual('location');
});

test('[VALID] [ORDERBY] [FAMERATING] : "fame_rating"', async () => {
    expect(await validateOrderBy('fame_rating')).toEqual('fame_rating');
});

test('[VALID] [ORDERBY] [COMMTAGS] : "common_tags"', async () => {
    expect(await validateOrderBy('common_tags')).toEqual('common_tags');
});

// -- ORDER BY INVALID TESTS -- //
test('[INVALID] [ORDERBY] [INVALIDCHARACTERS] : "invalid"', async () => {
    await expect(validateOrderBy('invalid')).rejects.toThrow();
});

test('[INVALID] [ORDERBY] [EMPTY] : ""', async () => {
    await expect(validateOrderBy('')).rejects.toThrow();
});

test('[INVALID] [ORDERBY] [EXTRACHARACTERS] : "agee"', async () => {
    await expect(validateOrderBy('agee')).rejects.toThrow();
});

test('[INVALID] [ORDERBY] [EXTRACHARACTERS] : "locationn"', async () => {
    await expect(validateOrderBy('locationn')).rejects.toThrow();
});

test('[INVALID] [ORDERBY] [EXTRACHARACTERS] : "fame_ratingg"', async () => {
    await expect(validateOrderBy('fame_ratingg')).rejects.toThrow();
});

test('[INVALID] [ORDERBY] [EXTRACHARACTERS] : "common_tagss"', async () => {
    await expect(validateOrderBy('common_tagss')).rejects.toThrow();
});
