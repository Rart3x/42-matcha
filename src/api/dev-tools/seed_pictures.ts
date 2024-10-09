import { sql } from '@api/connections/database.connection';

export async function seedPicturesSlot0() {
    await sql`
    WITH random_users AS (
        SELECT id
        FROM users
        ORDER BY random()
        LIMIT 2000
    )
    INSERT INTO pictures (user_id, position, url, mime_type)
    SELECT
        id,
        2,
        'public/profile_pictures/avatar' || id % 37 || '.jpg',
        'image/jpeg'
    FROM random_users
    `;
}

export async function seedPicturesSlot1() {
    await sql`
    WITH random_users AS (
        SELECT id
        FROM users
        ORDER BY random()
        LIMIT 2000
    )
    INSERT INTO pictures (user_id, position, url, mime_type)
    SELECT
        id,
        3,
        'public/profile_pictures/avatar' || id % 3 || '.jpg',
        'image/jpeg'
    FROM random_users
    `;
}

export async function seedPicturesSlot2() {
    await sql`
    WITH random_users AS (
        SELECT id
        FROM users
        ORDER BY random()
        LIMIT 2000
    )
    INSERT INTO pictures (user_id, position, url, mime_type)
    SELECT
        id,
        0,
        'public/profile_pictures/avatar' || id % 50 || '.jpg',
        'image/jpeg'
    FROM random_users
    `;
}

async function seed() {
    await seedPicturesSlot0();
    await seedPicturesSlot1();
    await seedPicturesSlot2();

    process.exit(0);
}

void seed();
