import { sql } from '@api/connections/database.connection';
import { faker } from '@faker-js/faker/locale/en';

export async function seedLocations() {
    const users = await sql<
        {
            id: number;
        }[]
    >`
        SELECT id
        FROM users
        ORDER BY RANDOM()
        LIMIT 1800;
    `;

    const locations = users.map((user) => {
        const coords = faker.location.nearbyGPSCoordinate({
            origin: [45.83879541447026, 1.2633053879004603],
            isMetric: true, // use km
            radius: 200,
        });

        return {
            user_id: user.id,
            latitude: coords[0],
            longitude: coords[1],
        };
    });

    await sql`
        INSERT INTO locations ${sql(locations)}
        ON CONFLICT DO NOTHING; 
    `;
}

async function seed() {
    await seedLocations();

    process.exit(0);
}

void seed();
