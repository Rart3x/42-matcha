import { Router } from 'express';
import { UnauthorizedError } from '@api/exceptions/UnauthorizedError';
import db from '@api/connections/database';

export const AccountController = Router();

AccountController.route('/account/register').post(async (req, res, next) => {
    const data = req.body as {
        email?: string;
        username?: string;
        password?: string;
        firstName?: string;
        lastName?: string;
    };

    if (!isValidEmailFormat(data.email)) {
        return next(new UnauthorizedError('Invalid email format'));
    }
    if (!isValidUsernameFormat(data.username)) {
        return next(new UnauthorizedError('Invalid username format'));
    }
    if (!isValidPasswordFormat(data.password)) {
        return next(new UnauthorizedError('Invalid password format'));
    }
    if (!isValidNameFormat(data.firstName)) {
        return next(new UnauthorizedError('Invalid first name format'));
    }
    if (!isValidNameFormat(data.lastName)) {
        return next(new UnauthorizedError('Invalid last name format'));
    }

    try {
        const rows = await db.sql<{
            registration_token?: string;
        }>(
            'SELECT create_registration($1, $2, $3, $4, $5) AS registration_token',
            [
                data.username,
                data.email,
                data.password,
                data.firstName,
                data.lastName,
            ],
        );

        const registrationToken = rows[0].registration_token;

        if (!registrationToken) {
            return next(new UnauthorizedError());
        }

        res.json({ message: 'Registration successful' });
    } catch (error) {
        if (error instanceof Error) {
            return next(new UnauthorizedError(error.message));
        }
        return next(new UnauthorizedError());
    }
});

AccountController.route('/account/confirm/:token').get(
    async (req, res, next) => {
        return next(new UnauthorizedError('Not implemented'));
    },
);

function isValidEmailFormat(email: string | undefined) {
    if (!email) {
        return false;
    }
    // check length, at least 5 characters, at most 100 characters
    if (email.length < 5 || email.length > 100) {
        return false;
    }
    // check contains @ and .
    if (!email.includes('@') || !email.includes('.')) {
        return false;
    }
    return true;
}

function isValidPasswordFormat(password: string | undefined) {
    if (!password) {
        return false;
    }
    // check length, at least 8 characters, at most 100 characters
    if (password.length < 8 || password.length > 100) {
        return false;
    }
    // check if contains at least one digit, one lowercase and one uppercase letter
    if (
        !password.match(/\d/) ||
        !password.match(/[a-z]/) ||
        !password.match(/[A-Z]/)
    ) {
        return false;
    }
    // check if contains at least one special character
    if (!password.match(/[^a-zA-Z0-9]/)) {
        return false;
    }
    return true;
}

function isValidUsernameFormat(username: string | undefined) {
    if (!username) {
        return false;
    }
    // check length, at least 5 characters, at most 20 characters
    if (username.length < 5 || username.length > 20) {
        return false;
    }
    // check if contains only alphanumeric characters
    if (!username.match(/^[0-9a-zA-Z]+$/)) {
        return false;
    }
    return true;
}

function isValidNameFormat(name: string | undefined) {
    if (!name) {
        return false;
    }
    // check length, at least 2 characters, at most 50 characters
    if (name.length < 2 || name.length > 50) {
        return false;
    }
    // check if contains only alphabets
    if (!name.match(/^[a-zA-Z]+$/)) {
        return false;
    }
    return true;
}
