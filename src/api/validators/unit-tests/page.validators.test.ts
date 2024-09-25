import { expect, test } from 'vitest';
import { validateOffset, validateLimit } from '@api/validators/page.validators';

// -- OFFSET LIMIT NAN TESTS -- //
test('Nan is an invalid offset', async () => {
    await expect(validateOffset(NaN)).rejects.toThrow();
});

test('Nan is an invalid limit', async () => {
    await expect(validateLimit(NaN)).rejects.toThrow();
});

// -- OFFSET LIMIT VALUE TESTS -- //
test('0 is a valid offset', async () => {
    expect(await validateOffset(0)).toEqual(0);
});

test('0 is a valid limit', async () => {
    expect(await validateLimit(0)).toEqual(0);
});

test('50 is a valid offset', async () => {
    expect(await validateOffset(50)).toEqual(50);
});

test('50 is a valid limit', async () => {
    expect(await validateLimit(50)).toEqual(50);
});

// -- OFFSET LIMIT OUT OF BOUNDS TESTS -- //
test('51 is an invalid offset', async () => {
    await expect(validateOffset(51)).rejects.toThrow();
});

test('51 is an invalid limit', async () => {
    await expect(validateLimit(51)).rejects.toThrow();
});

// -- OFFSET LIMIT NEGATIVE TESTS -- //
test('-1 is an invalid offset', async () => {
    await expect(validateOffset(-1)).rejects.toThrow();
});

test('-1 is an invalid limit', async () => {
    await expect(validateLimit(-1)).rejects.toThrow();
});
