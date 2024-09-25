import { expect, test } from 'vitest';
import {
    validateTag,
    validateTags,
    validateMinimumCommonTags,
} from '@api/validators/tag.validators';

// -- TAG NULL TESTS -- //
test('Empty string is an invalid tag', async () => {
    await expect(validateTag('')).rejects.toThrow();
});

// -- TAG LENGTH TESTS -- //
test('Tag length 1 is valid', async () => {
    expect(await validateTag('a')).toEqual('a');
});

test('Tag length 20 is valid', async () => {
    expect(await validateTag('a'.repeat(20))).toEqual('a'.repeat(20));
});

test('Tag length 21 is invalid', async () => {
    await expect(validateTag('a'.repeat(21))).rejects.toThrow();
});

// -- TAG CHARACTER TESTS -- //
test('Tag with only letters is valid', async () => {
    expect(await validateTag('abc')).toEqual('abc');
});

test('Tag with only numbers is valid', async () => {
    expect(await validateTag('123')).toEqual('123');
});

test('Tag with only hyphens is valid', async () => {
    expect(await validateTag('---')).toEqual('---');
});

test('Tag with letters and numbers is valid', async () => {
    expect(await validateTag('a1b2c3')).toEqual('a1b2c3');
});

test('Tag with letters and hyphens is valid', async () => {
    expect(await validateTag('a-b-c')).toEqual('a-b-c');
});

test('Tag with numbers and hyphens is valid', async () => {
    expect(await validateTag('1-2-3')).toEqual('1-2-3');
});

test('Tag with letters, numbers, and hyphens is valid', async () => {
    expect(await validateTag('a1-b2-c3')).toEqual('a1-b2-c3');
});

test('Tag with spaces is invalid', async () => {
    await expect(validateTag('a b c')).rejects.toThrow();
});

test('Tag with underscores is invalid', async () => {
    await expect(validateTag('a_b_c')).rejects.toThrow();
});

test('Tag with periods is invalid', async () => {
    await expect(validateTag('a.b.c')).rejects.toThrow();
});

// -- TAGS EMPTY TESTS -- //
test('Empty array is an invalid tags', async () => {
    await expect(validateTags([])).rejects.toThrow();
});

// -- MINIMUM COMMON TAGS NULL TESTS -- //
test('NaN is an invalid minimum common tags', async () => {
    await expect(validateMinimumCommonTags(NaN)).rejects.toThrow();
});

test('Negative infinity is an invalid minimum common tags', async () => {
    await expect(validateMinimumCommonTags(-Infinity)).rejects.toThrow();
});

// -- MINIMUM COMMON TAGS VALUE TESTS -- //
test('0 is a valid minimum common tags', async () => {
    expect(await validateMinimumCommonTags(0)).toEqual(0);
});

test('1 is a valid minimum common tags', async () => {
    expect(await validateMinimumCommonTags(1)).toEqual(1);
});

test('10 is a valid minimum common tags', async () => {
    expect(await validateMinimumCommonTags(10)).toEqual(10);
});

// -- MINIMUM COMMON TAGS OUT OF BOUNDS TESTS -- //
test('-1 is an invalid minimum common tags', async () => {
    await expect(validateMinimumCommonTags(-1)).rejects.toThrow();
});
