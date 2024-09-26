import { expect, test } from 'vitest';
import { validateLatitude, validateLongitude } from '@api/validators/location.validators';

// -- LATITUDE LONGITUDE NAN TESTS -- //
test('[INVALID] [LATITUDE] [ISNAN] : NaN', async () => {
    await expect(validateLatitude(NaN)).rejects.toThrow();
});

test('[INVALID] [LONGITUDE] [ISNAN] : NaN', async () => {
    await expect(validateLongitude(NaN)).rejects.toThrow();
});

// -- LATITUDE LONGITUDE VALUE TESTS -- //
test('[VALID] [LATITUDE] [ZERO] : 0', async () => {
    expect(await validateLatitude(0)).toEqual(0);
});

test('[VALID] [LONGITUDE] [ZERO] : 0', async () => {
    expect(await validateLongitude(0)).toEqual(0);
});

test('[VALID] [LATITUDE] [NINETY] : 90', async () => {
    expect(await validateLatitude(90)).toEqual(90);
});

test('[VALID] [LONGITUDE] [ONEHUNDREDANDEIGHTY] : 180', async () => {
    expect(await validateLongitude(180)).toEqual(180);
});

test('[VALID] [LATITUDE] : -90', async () => {
    expect(await validateLatitude(-90)).toEqual(-90);
});

test('[VALID] [LONGITUDE] : -180', async () => {
    expect(await validateLongitude(-180)).toEqual(-180);
});

// -- LATITUDE LONGITUDE OUT OF BOUNDS TESTS -- //
test('[INVALID] [LATITUDE] : 91', async () => {
    await expect(validateLatitude(91)).rejects.toThrow();
});

test('[INVALID] [LONGITUDE] : 181', async () => {
    await expect(validateLongitude(181)).rejects.toThrow();
});
