import { expect, test } from 'vitest';
import { validateLatitude, validateLongitude } from '@api/validators/location.validators';

// -- LATITUDE LONGITUDE NAN TESTS -- //
test('Nan is an invalid latitude', async () => {
    await expect(validateLatitude(NaN)).rejects.toThrow();
});

test('Nan is an invalid longitude', async () => {
    await expect(validateLongitude(NaN)).rejects.toThrow();
});

// -- LATITUDE LONGITUDE VALUE TESTS -- //
test('0 is a valid latitude', async () => {
    expect(await validateLatitude(0)).toEqual(0);
});

test('0 is a valid longitude', async () => {
    expect(await validateLongitude(0)).toEqual(0);
});

test('90 is a valid latitude', async () => {
    expect(await validateLatitude(90)).toEqual(90);
});

test('90 is a valid longitude', async () => {
    expect(await validateLongitude(180)).toEqual(180);
});

test('-90 is a valid latitude', async () => {
    expect(await validateLatitude(-90)).toEqual(-90);
});

test('-90 is a valid longitude', async () => {
    expect(await validateLongitude(-180)).toEqual(-180);
});

// -- LATITUDE LONGITUDE OUT OF BOUNDS TESTS -- //
test('91 is an invalid latitude', async () => {
    await expect(validateLatitude(91)).rejects.toThrow();
});

test('181 is an invalid longitude', async () => {
    await expect(validateLongitude(181)).rejects.toThrow();
});
