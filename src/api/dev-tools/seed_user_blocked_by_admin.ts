import { sql } from '@api/connections/database.connection';

async function seedUserBlockedByAdmin() {
    const user = {
        username: 'blocked',
        email: 'blocked@test.com',
        password: '$2a$08$mBA8.BAl8P5FHwpjswvV5O5V/XBCbc.BDSOHEhJv6c/m1h.EYNqGy', // 'Password1234@';
        first_name: 'Blocked',
        last_name: 'User',
        age: 26,
        biography: 'I am a blocked user',
        gender: 'male',
        sexual_pref: 'female',
    };

    await sql`
        INSERT INTO users ${sql(user)}
        ON CONFLICT DO NOTHING;
    `;

    const [admin]: [{ id: number }] = await sql`
        SELECT id FROM users WHERE username = 'admin';
    `;

    const [blocked]: [{ id: number }] = await sql`
        SELECT id FROM users WHERE username = 'blocked';
    `;

    await sql`
        INSERT INTO blocks (blocker_user_id, blocked_user_id)
        VALUES (${admin.id}, ${blocked.id});
    `;
}

async function seed() {
    await seedUserBlockedByAdmin();

    process.exit(0);
}

void seed();
