import { sql } from '@api/connections/database.connection';
import { faker } from '@faker-js/faker/locale/en';

function createMockTag() {
    const tag = faker.helpers
        .arrayElement([
            faker.food.dish(),
            faker.food.dish(),
            faker.animal.type(),
            faker.commerce.productName(),
        ])
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 20);

    return {
        name: tag,
    };
}

async function seedTags() {
    const mockTags = Array.from({ length: 100 }, createMockTag);

    await sql`
        INSERT INTO tags ${sql(mockTags)}
        ON CONFLICT DO NOTHING;
    `;

    await sql`
        WITH random_tags AS (SELECT id
                             FROM tags
                             ORDER BY RANDOM()),
             random_users AS (SELECT id
                              FROM users
                              ORDER BY RANDOM())
        INSERT
        INTO users_tags (user_id, tag_id)
        SELECT random_users.id, random_tags.id
        FROM random_tags,
             random_users
                 LEFT JOIN users_tags ON users_tags.user_id = random_users.id
        WHERE (SELECT COUNT(*)
               FROM users_tags
               WHERE user_id = random_users.id) < 10
        LIMIT 5000
        ON CONFLICT DO NOTHING;
    `;
}

async function seed() {
    await seedTags();

    process.exit(0);
}

void seed();
