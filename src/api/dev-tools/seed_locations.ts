import { sql } from '@api/connections/database.connection';

async function seedLocation() {
    await sql`
        WITH random_users AS (
            SELECT id 
            FROM users
            ORDER BY RANDOM()
            LIMIT 500
        )
        INSERT INTO locations (user_id, latitude, longitude)
        SELECT id, RANDOM() * 180 - 90, RANDOM() * 360 - 180
        FROM random_users;
    `;
}

async function seed() {
    await seedLocation();

    process.exit(0);
}

void seed();
