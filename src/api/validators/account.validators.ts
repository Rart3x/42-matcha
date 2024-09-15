import { badRequest } from '@api/errors/bad-request.error';

const ANGULAR_EMAIL_REGEX =
    /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;

export async function validateEmail(email?: string) {
    if (!email) {
        throw badRequest();
    }
    if (!ANGULAR_EMAIL_REGEX.test(email)) {
        throw badRequest();
    }
    return email;
}

export async function validateUsername(username?: string) {
    if (!username) {
        throw badRequest();
    }
    if (username.length < 3) {
        throw badRequest();
    }
    if (username.length > 20) {
        throw badRequest();
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw badRequest();
    }
    return username;
}

export async function validateName(name?: string) {
    if (!name) {
        throw badRequest();
    }
    if (name.length < 1) {
        throw badRequest();
    }
    if (name.length > 30) {
        throw badRequest();
    }
    if (!/[a-zA-Z]/.test(name)) {
        throw badRequest();
    }
    if (!/^[a-zA-Z]+[a-zA-Z-' ]*$/.test(name)) {
        throw badRequest();
    }
    return name;
}

export async function validatePassword(password?: string) {
    if (!password) {
        throw badRequest();
    }
    if (password.length < 8) {
        throw badRequest();
    }
    if (password.length > 30) {
        throw badRequest();
    }
    if (!/[a-z]/.test(password)) {
        throw badRequest();
    }
    if (!/[A-Z]/.test(password)) {
        throw badRequest();
    }
    if (!/[0-9]/.test(password)) {
        throw badRequest();
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
        throw badRequest();
    }
    return password;
}

const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

export async function validateToken(token?: string) {
    if (!token) {
        throw badRequest();
    }

    if (!UUID_REGEX.test(token)) {
        throw badRequest();
    }

    return token;
}
