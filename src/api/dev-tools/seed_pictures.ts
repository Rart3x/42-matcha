import { sql } from '@api/connections/database.connection';
import { faker } from '@faker-js/faker/locale/en';

async function seed() {
    const users = await sql<{ id: number }[]>`
        SELECT id
        FROM users
        ORDER BY RANDOM()
        LIMIT 2000;
    `;

    for (const user of users) {
        const rows = faker.helpers.multiple(
            (_, idx) => ({
                user_id: user.id,
                url: `public/profile_pictures/avatar${faker.number.int({ min: 0, max: 49 })}.jpg`,
                position: idx,
                mime_type: 'image/jpeg',
            }),
            {
                count: faker.number.int({ min: 1, max: 5 }),
            },
        );

        await sql`
            INSERT INTO pictures ${sql(rows)}
            ON CONFLICT DO NOTHING;
        `;
    }

    process.exit(0);
}

void seed();
