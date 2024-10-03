import { sql } from '@api/connections/database.connection';
import process from 'node:process';

export async function seedAdminUser() {
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

export async function seed() {
    await seedAdminUser();

    process.exit(0);
}

void seed();
