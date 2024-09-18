import { sql } from '@api/connections/database.connection';

async function seed() {
    await sql`
        WITH random_users AS (SELECT id, username
                              FROM users
                              WHERE username != 'admin'
                              ORDER BY RANDOM()
                              LIMIT 200),
            admin_user AS (SELECT id
                            FROM users
                            WHERE username = 'admin')
        INSERT 
        INTO likes (user_id, liked_user_id)
        SELECT u1.id, u2.id
        FROM random_users u1
                 JOIN admin_user u2 ON u2.id != u1.id
        UNION ALL
        SELECT u2.id, u1.id
        FROM random_users u1
                 JOIN admin_user u2 ON u2.id != u1.id
        ON CONFLICT DO NOTHING;
    `;

    process.exit(0);
}

void seed();
