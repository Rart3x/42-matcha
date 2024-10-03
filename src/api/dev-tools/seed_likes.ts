import { sql } from '@api/connections/database.connection';

async function seedLikes() {
    await sql`
        WITH random_users AS (
            SELECT id 
            FROM users
            ORDER BY RANDOM()
            LIMIT 500
        ),
        likes_candidates AS (
            SELECT u1.id AS user_id, u2.id AS liked_user_id,
                   ROW_NUMBER() OVER (PARTITION BY u1.id ORDER BY RANDOM()) AS rn
            FROM random_users u1
            JOIN random_users u2 ON u1.id <> u2.id  -- Ensure no self-likes
        )
        INSERT INTO likes (liker_user_id, liked_user_id)
        SELECT user_id, liked_user_id
        FROM likes_candidates
        WHERE rn <= 10  -- Ensure each user likes at most 10 other users
        ORDER BY RANDOM()
        LIMIT 500;
    `;
}

async function seed() {
    await seedLikes();

    process.exit(0);
}

void seed();
