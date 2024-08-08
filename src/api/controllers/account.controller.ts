import { Router } from 'express';
import { UnauthorizedError } from '@api/exceptions/UnauthorizedError';
import db from '@api/connections/database';
import { Validators } from '@angular/forms';
import { ValidationError } from '@api/exceptions/ValidationError';

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

AccountController.route('/account/exists/username/:username').get(
    async (req, res, next) => {
        const username = req.params.username as string | undefined;

        if (!username) {
            return next(new ValidationError('Username is required'));
        }

        if (!isValidUsernameFormat(username)) {
            return next(new ValidationError('Invalid username format'));
        }

        try {
            const rows = await db.sql<{
                exists: boolean;
            }>('SELECT username_exists($1) AS exists', [username]);

            const exists = rows[0].exists;

            if (exists === null || exists === undefined) {
                return next(new UnauthorizedError());
            }

            res.json({ exists });
        } catch (error) {
            if (error instanceof Error) {
                return next(new ValidationError(error.message));
            }
            return next(new ValidationError());
        }
    },
);

AccountController.route('/account/exists/email/:email').get(
    async (req, res, next) => {
        const email = req.params.email as string | undefined;

        if (!email) {
            return next(new ValidationError('Email is required'));
        }

        if (!isValidEmailFormat(email)) {
            return next(new ValidationError('Invalid email format'));
        }

        try {
            const rows = await db.sql<{
                exists: boolean;
            }>('SELECT email_exists($1) AS exists', [email]);

            const exists = rows[0].exists;

            if (exists === null || exists === undefined) {
                return next(new UnauthorizedError());
            }

            res.json({ exists });
        } catch (error) {
            if (error instanceof Error) {
                return next(new ValidationError(error.message));
            }
            return next(new ValidationError());
        }
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
    if (!email.includes('@')) {
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
    // check length, at least 3 characters, at most 20 characters
    if (username.length < 3 || 20 < username.length) {
        return false;
    }
    // check if contains only alpha characters and space
    if (!username.match(/^[a-zA-Z ]+$/)) {
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
