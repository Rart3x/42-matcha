import { expect, test } from 'vitest';
import {
    validateUserId,
    validateAge,
    validateSexualPref,
    validateBiography,
    validateGender,
} from '@api/validators/profile.validators';

// -- USERID NAN TESTS -- //
test('User ID NaN is invalid', async () => {
    await expect(validateUserId(NaN)).rejects.toThrow();
});

// -- USERID NEGATIVE TESTS -- //
test('User ID -1 is invalid', async () => {
    await expect(validateUserId(-1)).rejects.toThrow();
});

// -- AGE NAN TESTS -- //
test('Age NaN is invalid', async () => {
    await expect(validateAge(NaN)).rejects.toThrow();
});

// -- AGE NEGATIVE TESTS -- //
test('Age -1 is invalid', async () => {
    await expect(validateAge(-1)).rejects.toThrow();
});

// -- AGE FLOAT TESTS -- //
test('Age 18.5 is invalid', async () => {
    await expect(validateAge(18.5)).rejects.toThrow();
});

// -- AGE UNDER 18 TESTS -- //
test('Age 17 is invalid', async () => {
    await expect(validateAge(17)).rejects.toThrow();
});

// -- AGE OVER 120 TESTS -- //
test('Age 121 is invalid', async () => {
    await expect(validateAge(121)).rejects.toThrow();
});

// -- SEXUAL PREF INVALID TESTS -- //
test('Sexual preference "invalid" is invalid', async () => {
    await expect(validateSexualPref('invalid')).rejects.toThrow();
});

test('Sexual preference male is valid', async () => {
    expect(await validateSexualPref('male')).toEqual('male');
});

test('Sexual preference female is valid', async () => {
    expect(await validateSexualPref('female')).toEqual('female');
});

// -- BIOGRAPHY LENGTH TESTS -- //
test('Biography length 500 is valid', async () => {
    expect(await validateBiography('a'.repeat(500))).toEqual('a'.repeat(500));
});

test('Biography length 501 is invalid', async () => {
    await expect(validateBiography('a'.repeat(501))).rejects.toThrow();
});

// -- GENDER INVALID TESTS -- //
test('Gender "invalid" is invalid', async () => {
    await expect(validateGender('invalid')).rejects.toThrow();
});

test('Gender "male" is valid', async () => {
    expect(await validateGender('male')).toEqual('male');
});

test('Gender "female" is valid', async () => {
    expect(await validateGender('female')).toEqual('female');
});
