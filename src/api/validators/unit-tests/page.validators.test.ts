import { expect, test } from 'vitest';
import { validateOffset, validateLimit } from '@api/validators/page.validators';

// -- OFFSET LIMIT NAN TESTS -- //
test('[INVALID] [OFFSET] [ISNAN] : NaN', async () => {
    await expect(validateOffset(NaN)).rejects.toThrow();
});

test('[INVALID] [LIMIT] [ISNAN] : NaN', async () => {
    await expect(validateLimit(NaN)).rejects.toThrow();
});

// -- OFFSET LIMIT VALUE TESTS -- //
test('[VALID] [OFFSET] : 0', async () => {
    expect(await validateOffset(0)).toEqual(0);
});

test('[VALID] [LIMIT] : 0', async () => {
    expect(await validateLimit(0)).toEqual(0);
});

test('[VALID] [OFFSET]  : 50', async () => {
    expect(await validateOffset(50)).toEqual(50);
});

test('[VALID] [LIMIT] : 50', async () => {
    expect(await validateLimit(50)).toEqual(50);
});

// -- OFFSET LIMIT OUT OF BOUNDS TESTS -- //
test('[VALID] [OFFSET] : 51', async () => {
    expect(await validateOffset(51)).toEqual(51);
});

test('[INVALID] [LIMIT] : 51', async () => {
    await expect(validateLimit(51)).rejects.toThrow();
});

// -- OFFSET LIMIT NEGATIVE TESTS -- //
test('[INVALID] [OFFSET] : -1', async () => {
    await expect(validateOffset(-1)).rejects.toThrow();
});

test('[INVALID] [LIMIT] : -1', async () => {
    await expect(validateLimit(-1)).rejects.toThrow();
});
