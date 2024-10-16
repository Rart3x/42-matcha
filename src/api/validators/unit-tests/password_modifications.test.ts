import { expect, test } from 'vitest';
import { validateNewPassword } from '@api/validators/password_modifications.validators';

// -- NEW PASSWORD TESTS -- //
test('[INVALID] [NEWPASSWORD]: pass -> pass', async () => {
    await expect(validateNewPassword('pass', 'pass')).rejects.toThrow();
});

test('[VALID] [NEWPASSWORD]: pass -> pass2', async () => {
    expect(await validateNewPassword('pass2', 'pass')).toEqual('pass');
});
