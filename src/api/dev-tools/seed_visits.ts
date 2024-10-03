import { sql } from '@api/connections/database.connection';

async function seedVisits() {
    await sql`
        WITH random_users AS (
            SELECT id 
            FROM users
            ORDER BY RANDOM()
            LIMIT 500
        ),
        visits_candidates AS (
            SELECT u1.id AS user_id, u2.id AS visited_user_id,
                   ROW_NUMBER() OVER (PARTITION BY u1.id ORDER BY RANDOM()) AS rn
            FROM random_users u1
            JOIN random_users u2 ON u1.id <> u2.id  -- Ensure no self-visits
        )
        INSERT INTO visits (visiter_user_id, visited_user_id)
        SELECT user_id, visited_user_id
        FROM visits_candidates
        WHERE rn <= 10  -- Ensure each user visits at most 10 other users
        ORDER BY RANDOM()
        LIMIT 500;
    `;
}

async function seed() {
    await seedVisits();

    process.exit(0);
}

void seed();
