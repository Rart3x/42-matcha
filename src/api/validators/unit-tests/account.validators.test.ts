import { expect, test } from 'vitest';
import {
    validateEmail,
    validateUsername,
    validateName,
    validatePassword,
    validateToken,
} from '@api/validators/account.validators';

// -- EMAIL TESTS -- //
test('[INVALID] [EMAIL] : ""', async () => {
    await expect(validateEmail('')).rejects.toThrow();
});

test('[INVALID] [EMAIL] : "invalid"', async () => {
    await expect(validateEmail('invalid')).rejects.toThrow();
});

test('[INVALID] [EMAIL] : "invalid.com"', async () => {
    await expect(validateEmail('invalid.com')).rejects.toThrow();
});

test('[VALID] [EMAIL] : "keny@test.com"', async () => {
    const email = 'keny@test.com';
    expect(await validateEmail(email)).toBe(email);
});

// -- USERNAME TESTS -- //
test('[INVALID] [USERNAME] : ""', async () => {
    await expect(validateUsername('')).rejects.toThrow();
});

test('[INVALID] [USERNAME] [LENGTH] : "12"', async () => {
    await expect(validateUsername('12')).rejects.toThrow();
});

test('[INVALID] [USERNAME] [LENGTH] : "123456789012345678901"', async () => {
    await expect(validateUsername('123456789012345678901')).rejects.toThrow();
});

test('[INVALID] [USERNAME] [CARACTER] : "invalid-username"', async () => {
    await expect(validateUsername('invalid-username')).rejects.toThrow();
});

test('[VALID] [USERNAME] : "valid_username"', async () => {
    const username = 'valid_username';
    expect(await validateUsername(username)).toBe(username);
});

// -- NAME TESTS -- //
test('[INVALID] [NAME] : ""', async () => {
    await expect(validateName('')).rejects.toThrow();
});

test('[INVALID] [NAME] [LENGTH] : ""', async () => {
    await expect(validateName('')).rejects.toThrow();
});

test('[INVALID] [NAME] [LENGTH] : "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"', async () => {
    await expect(validateName('a'.repeat(31))).rejects.toThrow();
});

test('[INVALID] [NAME] [CARACTER] : "invalid$name"', async () => {
    await expect(validateName('invalid$name')).rejects.toThrow();
});

test('[VALID] [NAME] : "Valid Name"', async () => {
    const name = 'Valid Name';
    expect(await validateName(name)).toBe(name);
});

// -- PASSWORD TESTS -- //
test('[INVALID] [PASSWORD] [LENGTH] : ""', async () => {
    await expect(validatePassword('')).rejects.toThrow();
});

test('[INVALID] [PASSWORD] [LENGTH] : "1234567"', async () => {
    await expect(validatePassword('1234567')).rejects.toThrow();
});

test('[INVALID] [PASSWORD] [LENGTH] : "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"', async () => {
    await expect(validatePassword('a'.repeat(31))).rejects.toThrow();
});

test('[INVALID] [PASSWORD] [LOWERCASELESS] : "PASSWORD123"', async () => {
    await expect(validatePassword('PASSWORD123')).rejects.toThrow();
});

test('[INVALID] [PASSWORD] [UPPERCASELESS] : "password123"', async () => {
    await expect(validatePassword('password123')).rejects.toThrow();
});

test('[INVALID] [PASSWORD] [NUMBERLESS] :', async () => {
    await expect(validatePassword('Password')).rejects.toThrow();
});

test('[VALID] [PASSWORD] [CONTAINS SPECIAL CHARACTERS] : "Password123!"', async () => {
    const password = 'Password123!';
    expect(await validatePassword(password)).toBe(password);
});

test('[INVALID] [PASSWORD] [NO SPECIAL CHARACTERS] : "Password123"', async () => {
    await expect(validatePassword('Password123')).rejects.toThrow();
});

// -- TOKEN TESTS -- //
test('[VALID] [TOKEN] [UUID FORMAT] : "00000000-0000-0000-0000-000000000000"', async () => {
    const token = '00000000-0000-0000-0000-000000000000';
    expect(await validateToken(token)).toBe(token);
});

test('[INVALID] [TOKEN] [EMPTY] : ""', async () => {
    await expect(validateToken('')).rejects.toThrow();
});

test('[INVALID] [TOKEN] [INVALID FORMAT] : "invalid"', async () => {
    await expect(validateToken('invalid')).rejects.toThrow();
});
