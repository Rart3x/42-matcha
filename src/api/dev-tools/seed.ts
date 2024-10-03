import * as process from 'node:process';
import { seedAdminUser } from '@api/dev-tools/seed_admin';
import { seedTags } from '@api/dev-tools/seed_tags';
import { seedLikes } from '@api/dev-tools/seed_likes';
import { seedLocations } from '@api/dev-tools/seed_locations';
import { seedMessages } from '@api/dev-tools/seed_messages';
import { seedVisits } from '@api/dev-tools/seed_visits';
import { faker } from '@faker-js/faker/locale/en';
import { sql } from '@api/connections/database.connection';

/**
 * This script seeds the database with mock users for demonstration purposes.
 * @note This script is intended for development purposes only.
 * @file seed.ts
 */

function seedUsers() {
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

async function seed() {
    console.log('seeding admin user...');
    await seedAdminUser();

    console.log('seeding mock users...');
    const mockUsers = Array.from({ length: 2000 }, seedUsers);

    await sql`
        INSERT INTO users ${sql(mockUsers)}
        ON CONFLICT DO NOTHING;
    `;

    console.log('seeding mock tags...');
    console.log('seeding users/tags relationships...');
    await seedTags();

    console.log('seeding users/likes...');
    await seedLikes();

    console.log('seeding users/visits...');
    await seedVisits();

    console.log('seeding users/messages...');
    await seedMessages();

    console.log('seeding users/locations...');
    await seedLocations();

    process.exit(0);
}

void seed();
