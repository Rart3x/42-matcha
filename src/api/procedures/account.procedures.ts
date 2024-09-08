import { procedure } from '@api/lib/procedure';
import { err, ok, safeTry } from '@api/lib/result';
import { sql } from '@api/connections/database';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const createAccountProcedure = procedure(
    'createAccount',
    {} as {
        email: string;
        username: string;
        password: string;
        firstName: string;
        lastName: string;
    },
    (params) => {
        return safeTry(async function* () {
            // validate format

            const email = yield* validateEmail(params.email).safeUnwrap();
            const username = yield* validateUsername(params.username).safeUnwrap();
            const password = yield* validatePassword(params.password).safeUnwrap();
            const firstName = yield* validateName(params.firstName).safeUnwrap();
            const lastName = yield* validateName(params.lastName).safeUnwrap();

            const token = yield* (
                await sql.begin(async (sql) => {
                    // check if email is already in use
                    const [userEmailExists]: [{ exists: boolean }?] = await sql`
                        SELECT EXISTS(SELECT 1 FROM users WHERE email = ${email}) AS exists
                    `;
                    const [registrationEmailExists]: [{ exists: boolean }?] = await sql`
                        SELECT EXISTS(
                            SELECT 1 
                            FROM users_registrations 
                            WHERE email = ${email} AND expires_at > NOW()
                        ) AS exists
                    `;
                    if (userEmailExists?.exists || registrationEmailExists?.exists) {
                        return err('Email already in use');
                    }

                    // check if username is already in use
                    const [userUsernameExists]: [{ exists: boolean }?] = await sql`
                        SELECT EXISTS(SELECT 1 FROM users WHERE username = ${username}) AS exists
                    `;
                    const [registrationUsernameExists]: [{ exists: boolean }?] = await sql`
                        SELECT EXISTS(
                            SELECT 1 
                            FROM users_registrations 
                            WHERE username = ${username} AND expires_at > NOW()
                        ) AS exists
                    `;
                    if (userUsernameExists?.exists || registrationUsernameExists?.exists) {
                        return err('Username already in use');
                    }

                    // remove expired registrations
                    await sql`
                        DELETE FROM users_registrations
                        WHERE (email = ${email} OR username = ${username}) AND expires_at < NOW()
                    `;

                    // create account
                    const [registration]: [{ token: string }?] = await sql`
                        INSERT INTO users_registrations (email, username, password, first_name, last_name)
                        VALUES (${email}, ${username}, crypt(${password}, gen_salt('bf', 8)), ${firstName}, ${lastName})
                        RETURNING users_registrations.token AS token
                    `;

                    const token = registration?.token;

                    if (!token) {
                        return err('Failed to create account');
                    }

                    return ok(token);
                })
            ).safeUnwrap();

            // TODO: send email
            console.log({ token });

            return ok({ message: 'Registration successful' });
        });
    },
);

const ANGULAR_EMAIL_REGEX =
    /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;

function validateEmail(email?: string) {
    return safeTry(function* () {
        if (!email) {
            return err('Email is required');
        }
        if (!ANGULAR_EMAIL_REGEX.test(email)) {
            return err('Invalid email format');
        }
        return ok(email);
    });
}

function validateUsername(username?: string) {
    return safeTry(function* () {
        if (!username) {
            return err('Username is required');
        }
        if (username.length < 3) {
            return err('Username must be at least 3 characters');
        }
        if (username.length > 20) {
            return err('Username must be at most 20 characters');
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return err('Username must only contain letters, numbers, and underscores');
        }
        return ok(username);
    });
}

function validateName(name?: string) {
    return safeTry(function* () {
        if (!name) {
            return err('Name is required');
        }
        if (name.length < 1) {
            return err('Name must be at least 1 characters');
        }
        if (name.length > 30) {
            return err('Name must be at most 30 characters');
        }
        if (!/[a-zA-Z]/.test(name)) {
            return err('Name must contain at least one letter');
        }
        if (!/^[a-zA-Z]+[a-zA-Z-' ]*$/.test(name)) {
            return err('Name must only contain letters, spaces, hyphens, and apostrophes');
        }
        return ok(name);
    });
}

function validatePassword(password?: string) {
    return safeTry(function* () {
        if (!password) {
            return err('Password is required');
        }
        if (password.length < 8) {
            return err('Password must be at least 8 characters');
        }
        if (password.length > 30) {
            return err('Password must be at most 30 characters');
        }
        if (!/[a-z]/.test(password)) {
            return err('Password must contain at least one lowercase letter');
        }
        if (!/[A-Z]/.test(password)) {
            return err('Password must contain at least one uppercase letter');
        }
        if (!/[0-9]/.test(password)) {
            return err('Password must contain at least one number');
        }
        if (!/[^a-zA-Z0-9]/.test(password)) {
            return err('Password must contain at least one special character');
        }
        return ok(password);
    });
}
