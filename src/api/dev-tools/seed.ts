import { faker } from '@faker-js/faker/locale/en';
import { sql } from '@api/connections/database.connection';
import * as process from 'node:process';
// @ts-ignore
import tqdm from 'tqdm';

/**
 * This script seeds the database with mock users for demonstration purposes.
 * @note This script is intended for development purposes only.
 * @file seed.ts
 */

async function seedAdminUser() {
    const admin = {
        username: 'admin',
        email: 'admin@localhost.com',
        password: '$2a$08$mBA8.BAl8P5FHwpjswvV5O5V/XBCbc.BDSOHEhJv6c/m1h.EYNqGy', // 'Password1234@';
        first_name: 'Admin',
        last_name: 'User',
        age: 26,
        biography: 'I am an admin user',
        gender: 'male',
        sexual_pref: 'female',
    };

    await sql`
        INSERT INTO users ${sql(admin)}
        ON CONFLICT DO NOTHING;
    `;
}

function createMockUser() {
    const gender = faker.helpers.arrayElement(['male', 'female', 'other']);
    const sexual_pref = faker.helpers.arrayElement(['male', 'female', 'any']);

    const first_name = faker.person.firstName(gender === 'other' ? undefined : gender);
    const last_name = faker.person.lastName(gender === 'other' ? undefined : gender);

    const username = faker.internet
        .userName({
            firstName: first_name,
            lastName: last_name,
        })
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 20);

    const email = faker.internet.email({
        firstName: first_name,
        lastName: last_name,
    });

    const password = '$2a$08$mBA8.BAl8P5FHwpjswvV5O5V/XBCbc.BDSOHEhJv6c/m1h.EYNqGy'; // 'Password1234@';

    const age = faker.number.int({ min: 18, max: 120 });

    const biography = faker.person.bio();

    return {
        username,
        email,
        password,
        first_name,
        last_name,
        age,
        biography,
        gender,
        sexual_pref,
    };
}

function createMockTag() {
    const tag = faker.helpers
        .arrayElement([
            faker.food.dish(),
            faker.food.dish(),
            faker.animal.type(),
            faker.commerce.productName(),
        ])
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 20);

    return {
        name: tag,
    };
}

async function seedUsers() {}

async function seed() {
    console.log('seeding admin user...');
    await seedAdminUser();

    console.log('seeding mock users...');

    const mockUsers = Array.from({ length: 2000 }, createMockUser);

    await sql`
        INSERT INTO users ${sql(mockUsers)}
        ON CONFLICT DO NOTHING;
    `;

    console.log('seeding mock tags...');

    const mockTags = Array.from({ length: 100 }, createMockTag);

    await sql`
        INSERT INTO tags ${sql(mockTags)}
        ON CONFLICT DO NOTHING;
    `;

    console.log('seeding users/tags relationships...');

    // create relationships between users and tags
    await sql`
        WITH random_tags AS (SELECT id
                             FROM tags
                             ORDER BY RANDOM()),
             random_users AS (SELECT id
                              FROM users
                              ORDER BY RANDOM())
        INSERT
        INTO users_tags (user_id, tag_id)
        SELECT random_users.id, random_tags.id
        FROM random_tags,
             random_users
                 LEFT JOIN users_tags ON users_tags.user_id = random_users.id
        WHERE (SELECT COUNT(*)
               FROM users_tags
               WHERE user_id = random_users.id) < 10
        LIMIT 5000
        ON CONFLICT DO NOTHING;
    `;

    await sql.end();

    process.exit(0);
}

void seed();
