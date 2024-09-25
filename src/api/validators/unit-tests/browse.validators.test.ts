import { expect, test } from 'vitest';
import { validateRating, validateOrderBy } from '@api/validators/browse.validator';

// -- RATING NAN TESTS -- //
test('Nan is an invalid rating', async () => {
    await expect(validateRating(NaN)).rejects.toThrow();
});

// -- RATING VALUE TESTS -- //
test('0 is a valid rating', async () => {
    expect(await validateRating(0)).toEqual(0);
});

test('5 is a valid rating', async () => {
    expect(await validateRating(5)).toEqual(5);
});

// -- ORDER BY VALUE TESTS -- //
test('age is a valid order by', async () => {
    expect(await validateOrderBy('age')).toEqual('age');
});

test('location is a valid order by', async () => {
    expect(await validateOrderBy('location')).toEqual('location');
});

test('fame_rating is a valid order by', async () => {
    expect(await validateOrderBy('fame_rating')).toEqual('fame_rating');
});

test('common_tags is a valid order by', async () => {
    expect(await validateOrderBy('common_tags')).toEqual('common_tags');
});

// -- ORDER BY INVALID TESTS -- //
test('Invalid order by', async () => {
    await expect(validateOrderBy('invalid')).rejects.toThrow();
});

test('Invalid order by', async () => {
    await expect(validateOrderBy('')).rejects.toThrow();
});

test('Invalid order by', async () => {
    await expect(validateOrderBy('agee')).rejects.toThrow();
});

test('Invalid order by', async () => {
    await expect(validateOrderBy('locationn')).rejects.toThrow();
});

test('Invalid order by', async () => {
    await expect(validateOrderBy('fame_ratingg')).rejects.toThrow();
});

test('Invalid order by', async () => {
    await expect(validateOrderBy('common_tagss')).rejects.toThrow();
});
