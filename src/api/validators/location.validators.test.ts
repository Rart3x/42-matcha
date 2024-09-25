import { expect, test } from 'vitest';
import { validateLatitude } from '@api/validators/location.validators';

test('0 is a valid latitude', async () => {
    expect(await validateLatitude(0)).toEqual(0);
});
