import { sql } from '@api/connections/database.connection';
import { faker } from '@faker-js/faker/locale/en';

export async function seedAdminMessages() {
    const randomUsers = await sql<
        {
            user_id: number;
        }[]
    >`
    WITH random_users AS (
        SELECT
            id AS user_id
        FROM users
        ORDER BY RANDOM()
        LIMIT 500
    )
    SELECT user_id FROM random_users;
`;

    const admin = await sql<
        {
            admin_id: number;
        }[]
    >`
    SELECT id AS admin_id
    FROM users
    WHERE username = 'admin'
    LIMIT 1;
`;

    const admin_id = admin[0]?.admin_id;

    if (admin_id) {
        for (const { user_id } of randomUsers) {
            const numMessages = faker.number.int({
                min: 1,
                max: 50,
            });

            const messages = Array.from({ length: numMessages }, () => {
                const sender_id = user_id;
                const receiver_id = admin_id;
                const message = faker.lorem.sentence();

                return {
                    sender_id,
                    receiver_id,
                    message,
                };
            });

            await sql`
            INSERT INTO
                messages ${sql(messages)}
        `;
        }
    }
}

async function seed() {
    await seedAdminMessages();

    process.exit(0);
}

void seed();
