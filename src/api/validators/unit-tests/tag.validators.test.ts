import { expect, test } from 'vitest';
import {
    validateTag,
    validateTags,
    validateMinimumCommonTags,
} from '@api/validators/tag.validators';

// -- TAG NULL TESTS -- //
test('[INVALID] [TAG] [EMPTY] : ""', async () => {
    await expect(validateTag('')).rejects.toThrow();
});

// -- TAG LENGTH TESTS -- //
test('[VALID] [TAG] [LENGTH1] : "a"', async () => {
    expect(await validateTag('a')).toEqual('a');
});

test('[VALID] [TAG] [LENGTH20] : "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"', async () => {
    expect(await validateTag('a'.repeat(20))).toEqual('a'.repeat(20));
});

test('[INVALID] [TAG] [LENGTH21] : "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"', async () => {
    await expect(validateTag('a'.repeat(21))).rejects.toThrow();
});

// -- TAG CHARACTER TESTS -- //
test('[VALID] [TAG] [LETTERS] : "abc"', async () => {
    expect(await validateTag('abc')).toEqual('abc');
});

test('[VALID] [TAG] [NUMBERS] : "123"', async () => {
    expect(await validateTag('123')).toEqual('123');
});

test('[VALID] [TAG] [HYPHENS] : "---"', async () => {
    expect(await validateTag('---')).toEqual('---');
});

test('[VALID] [TAG] [LETTERSNUMBERS] : "a1b2c3"', async () => {
    expect(await validateTag('a1b2c3')).toEqual('a1b2c3');
});

test('[VALID] [TAG] : "a-b-c"', async () => {
    expect(await validateTag('a-b-c')).toEqual('a-b-c');
});

test('[VALID] [TAG] : "1-2-3"', async () => {
    expect(await validateTag('1-2-3')).toEqual('1-2-3');
});

test('[VALID] [TAG] : "a1-b2-c3"', async () => {
    expect(await validateTag('a1-b2-c3')).toEqual('a1-b2-c3');
});

test('[INVALID] [TAG] [SPACES] : "a b c"', async () => {
    await expect(validateTag('a b c')).rejects.toThrow();
});

test('[INVALID] [TAG] [UNDERSCORES] : "a_b_c"', async () => {
    await expect(validateTag('a_b_c')).rejects.toThrow();
});

test('[INVALID] [TAG] [DOTS] : "a.b.c"', async () => {
    await expect(validateTag('a.b.c')).rejects.toThrow();
});

// -- TAGS EMPTY TESTS -- //
test('[INVALID] [TAGS] [EMPTYARRAY] : []', async () => {
    await expect(validateTags([])).rejects.toThrow();
});

// -- MINIMUM COMMON TAGS NULL TESTS -- //
test('[INVALID] [MINCOMMONTAGS] [ISNAN] : NaN', async () => {
    await expect(validateMinimumCommonTags(NaN)).rejects.toThrow();
});

test('[INVALID] [MINCOMMONTAGS] [NEGATIVEINFINITY] : -Infinity', async () => {
    await expect(validateMinimumCommonTags(-Infinity)).rejects.toThrow();
});

// -- MINIMUM COMMON TAGS VALUE TESTS -- //
test('[VALID] [MINCOMMONTAGS] [ZERO] : 0', async () => {
    expect(await validateMinimumCommonTags(0)).toEqual(0);
});

test('[VALID] [MINCOMMONTAGS] [ONE] : 1', async () => {
    expect(await validateMinimumCommonTags(1)).toEqual(1);
});

test('[VALID] [MINCOMMONTAGS] [TEN] : 10', async () => {
    expect(await validateMinimumCommonTags(10)).toEqual(10);
});

// -- MINIMUM COMMON TAGS OUT OF BOUNDS TESTS -- //
test('[INVALID] [MINCOMMONTAGS] [NEGATIVEONE] : -1', async () => {
    await expect(validateMinimumCommonTags(-1)).rejects.toThrow();
});
