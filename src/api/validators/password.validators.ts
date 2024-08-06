import { ApiValidator } from '@api/validators/ApiValidator';

export const passwordValidators: ApiValidator[] = [
    {
        name: 'required',
        message: 'Password is required',
        validate: (value) => !!value,
    },
    {
        name: 'minLength',
        message: 'Password must be at least 8 characters',
        validate: (value) => !!value && value.length >= 8,
    },
    {
        name: 'maxLength',
        message: 'Password must be at most 100 characters',
        validate: (value) => !!value && value.length <= 100,
    },
    {
        name: 'containsUppercase',
        message: 'Password must contain at least one uppercase letter',
        validate: (value) => /[A-Z]/.test(value || ''),
    },
    {
        name: 'containsLowercase',
        message: 'Password must contain at least one lowercase letter',
        validate: (value) => /[a-z]/.test(value || ''),
    },
    {
        name: 'containsNumber',
        message: 'Password must contain at least one number',
        validate: (value) => /[0-9]/.test(value || ''),
    },
    {
        name: 'containsSpecialCharacter',
        message: 'Password must contain at least one special character',
        validate: (value) => /[^a-zA-Z0-9]/.test(value || ''),
    },
];
