import { sql } from '@api/connections/database.connection';
import { faker } from '@faker-js/faker/locale/en';

export async function seedMessages() {
    const pairs = await sql<
        {
            user_1: number;
            user_2: number;
        }[]
    >`
        WITH
            random_users_1 AS (
                SELECT
                    id
                FROM users
                ORDER BY
                    RANDOM()
            ),
            random_users_2 AS (
                SELECT
                    id
                FROM users
                ORDER BY
                    RANDOM()
            )
        SELECT
            u1.id AS user_1,
            u2.id AS user_2
        FROM random_users_1 u1
            JOIN random_users_2 u2
                ON u1.id <> u2.id
        LIMIT 500;
    `;

    for (const { user_1, user_2 } of pairs) {
        const numMessages = faker.number.int({
            min: 1,
            max: 50,
        });

        const messages = Array.from({ length: numMessages }, () => {
            const sender_id = faker.datatype.boolean() ? user_1 : user_2;
            const receiver_id = sender_id === user_1 ? user_2 : user_1;
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

async function seed() {
    await seedMessages();

    process.exit(0);
}

void seed();
