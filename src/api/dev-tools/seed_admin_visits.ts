import { sql } from '@api/connections/database.connection';

async function seed() {
    await sql`
        WITH random_users AS (SELECT id, username
                              FROM users
                              ORDER BY RANDOM()
                              LIMIT 500),
             admin AS (SELECT id
                       FROM users
                       WHERE username = 'admin')
        INSERT
        INTO visits (user_id, visited_user_id)
        SELECT u1.id, u2.id
        FROM random_users u1
                 JOIN admin u2 ON u1.id <> u2.id
        ORDER BY RANDOM()
        LIMIT 500;
    `;

    process.exit(0);
}

void seed();
