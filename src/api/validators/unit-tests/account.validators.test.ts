import { expect, test } from 'vitest';
import {
    validateEmail,
    validateUsername,
    validateName,
    validatePassword,
    validateToken,
} from '@api/validators/account.validators';

// -- EMAIL TESTS -- //
test('Empty email is invalid', async () => {
    await expect(validateEmail('')).rejects.toThrow();
});

test('Invalid email is invalid', async () => {
    await expect(validateEmail('invalid')).rejects.toThrow();
});

test('Email without @ is invalid', async () => {
    await expect(validateEmail('invalid.com')).rejects.toThrow();
});

test('Valid email is valid', async () => {
    const email = 'keny@test.com';
    expect(await validateEmail(email)).toBe(email);
});

// -- USERNAME TESTS -- //
test('Empty username is invalid', async () => {
    await expect(validateUsername('')).rejects.toThrow();
});

test('Username less than 3 characters is invalid', async () => {
    await expect(validateUsername('12')).rejects.toThrow();
});

test('Username more than 20 characters is invalid', async () => {
    await expect(validateUsername('123456789012345678901')).rejects.toThrow();
});

test('Username with invalid characters is invalid', async () => {
    await expect(validateUsername('invalid-username')).rejects.toThrow();
});

test('Valid username is valid', async () => {
    const username = 'valid_username';
    expect(await validateUsername(username)).toBe(username);
});

// -- NAME TESTS -- //
test('Empty name is invalid', async () => {
    await expect(validateName('')).rejects.toThrow();
});

test('Name less than 1 character is invalid', async () => {
    await expect(validateName('')).rejects.toThrow();
});

test('Name more than 30 characters is invalid', async () => {
    await expect(validateName('a'.repeat(31))).rejects.toThrow();
});

test('Name with invalid format is invalid', async () => {
    await expect(validateName('invalid$name')).rejects.toThrow();
});

test('Valid name is valid', async () => {
    const name = 'Valid Name';
    expect(await validateName(name)).toBe(name);
});

// -- PASSWORD TESTS -- //
test('Empty password is invalid', async () => {
    await expect(validatePassword('')).rejects.toThrow();
});

test('Password less than 8 characters is invalid', async () => {
    await expect(validatePassword('1234567')).rejects.toThrow();
});

test('Password more than 30 characters is invalid', async () => {
    await expect(validatePassword('a'.repeat(31))).rejects.toThrow();
});

test('Password without lowercase character is invalid', async () => {
    await expect(validatePassword('PASSWORD123')).rejects.toThrow();
});

test('Password without uppercase character is invalid', async () => {
    await expect(validatePassword('password123')).rejects.toThrow();
});

test('Password without number is invalid', async () => {
    await expect(validatePassword('Password')).rejects.toThrow();
});

test('Password without special character is invalid', async () => {
    await expect(validatePassword('Password123')).rejects.toThrow();
});

test('Valid password is valid', async () => {
    const password = 'Password123!';
    expect(await validatePassword(password)).toBe(password);
});

// -- TOKEN TESTS -- //
test('Empty token is invalid', async () => {
    await expect(validateToken('')).rejects.toThrow();
});

test('Invalid token is invalid', async () => {
    await expect(validateToken('invalid')).rejects.toThrow();
});

test('Valid token is valid', async () => {
    const token = '00000000-0000-0000-0000-000000000000';
    expect(await validateToken(token)).toBe(token);
});
