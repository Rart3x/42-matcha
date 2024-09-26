import { expect, test } from 'vitest';
import {
    validateUserId,
    validateAge,
    validateSexualPref,
    validateBiography,
    validateGender,
} from '@api/validators/profile.validators';

// -- USERID NAN TESTS -- //
test('[INVALID] [USERID] [ISNAN] : NaN', async () => {
    await expect(validateUserId(NaN)).rejects.toThrow();
});

// -- USERID NEGATIVE TESTS -- //
test('[INVALID] [USERID] [NEGATIVE] : -1', async () => {
    await expect(validateUserId(-1)).rejects.toThrow();
});

// -- AGE NAN TESTS -- //
test('[INVALID] [AGE] [ISNAN] : NaN', async () => {
    await expect(validateAge(NaN)).rejects.toThrow();
});

// -- AGE NEGATIVE TESTS -- //
test('[INVALID] [AGE] [NEGATIVE] : -1', async () => {
    await expect(validateAge(-1)).rejects.toThrow();
});

// -- AGE FLOAT TESTS -- //
test('[INVALID] [AGE] [FLOAT] : 18.5', async () => {
    await expect(validateAge(18.5)).rejects.toThrow();
});

// -- AGE UNDER 18 TESTS -- //
test('[INVALID] [AGE] [UNDER18] : 17', async () => {
    await expect(validateAge(17)).rejects.toThrow();
});

// -- AGE OVER 120 TESTS -- //
test('[INVALID] [AGE] [OVER120] : 121', async () => {
    await expect(validateAge(121)).rejects.toThrow();
});

// -- SEXUAL PREF INVALID TESTS -- //
test('[INVALID] [SEXUALPREF] [INVALIDVALUE] : "invalid"', async () => {
    await expect(validateSexualPref('invalid')).rejects.toThrow();
});

test('[VALID] [SEXUALPREF] : "male"', async () => {
    expect(await validateSexualPref('male')).toEqual('male');
});

test('[VALID] [SEXUALPREF] : "female"', async () => {
    expect(await validateSexualPref('female')).toEqual('female');
});

// -- BIOGRAPHY LENGTH TESTS -- //
test('[VALID] [BIOGRAPHY] [LENGTH500] : "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"', async () => {
    expect(await validateBiography('a'.repeat(500))).toEqual('a'.repeat(500));
});

test('[INVALID] [BIOGRAPHY] [LENGTH501] : "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"', async () => {
    await expect(validateBiography('a'.repeat(501))).rejects.toThrow();
});

// -- GENDER INVALID TESTS -- //
test('[INVALID] [GENDER] [INVALIDVALUE] : "invalid"', async () => {
    await expect(validateGender('invalid')).rejects.toThrow();
});

test('[VALID] [GENDER] : "male"', async () => {
    expect(await validateGender('male')).toEqual('male');
});

test('[VALID] [GENDER] : "female"', async () => {
    expect(await validateGender('female')).toEqual('female');
});
