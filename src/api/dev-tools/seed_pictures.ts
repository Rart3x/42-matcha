import { sql } from '@api/connections/database.connection';

export async function seedPictures() {
    await sql`
    WITH random_users AS (
        SELECT id
        FROM users
        ORDER BY random()
        LIMIT 500
    )
    INSERT INTO pictures (user_id, position, url, mime_type)
    SELECT
        id,
        2,
        '/profile_pictures/avatar' || id % 50 || '.jpg',
        'image/jpeg'
    FROM random_users
    `;
}

async function seed() {
    await seedPictures();

    process.exit(0);
}

void seed();
