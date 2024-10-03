import { sql } from '@api/connections/database.connection';
import { faker } from '@faker-js/faker/locale/en';

export async function seedMessages() {
    const messages = Array.from({ length: 500 }, () => faker.lorem.sentence());

    await sql`
        WITH random_users AS (
            SELECT id 
            FROM users
            ORDER BY RANDOM()
            LIMIT 500
        ),
        messages_candidates AS (
            SELECT u1.id AS sender_id, u2.id AS receiver_id,
                   ROW_NUMBER() OVER (PARTITION BY u1.id ORDER BY RANDOM()) AS rn
            FROM random_users u1
            JOIN random_users u2 ON u1.id <> u2.id
        )
        INSERT INTO messages (sender_id, receiver_id, message)
        SELECT sender_id, receiver_id, unnest(${sql.array(messages)})
        FROM messages_candidates
        WHERE rn <= 10
        LIMIT 500;
    `;
}

async function seed() {
    await seedMessages();

    process.exit(0);
}

void seed();
