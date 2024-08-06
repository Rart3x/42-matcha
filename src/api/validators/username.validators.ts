import { ApiValidator } from './ApiValidator';

export const usernameValidators: ApiValidator[] = [
    {
        name: 'required',
        message: 'Username is required',
        validate: (value) => !!value,
    },
    {
        name: 'minLength',
        message: 'Username must be at least 3 characters',
        validate: (value) => !!value && value.length >= 3,
    },
    {
        name: 'maxLength',
        message: 'Username must be at most 20 characters',
        validate: (value) => !!value && value.length <= 20,
    },
    {
        name: 'containsOnlyLettersAndNumbers',
        message: 'Username must contain only letters and numbers',
        validate: (value) => /^[a-zA-Z0-9]+$/.test(value || ''),
    },
];
