// import postgres from 'postgres';
//
import postgres from 'postgres';

export const sql = postgres({
    host: process.env['DB_HOST'] || 'localhost',
    port: parseInt(process.env['DB_PORT'] || '5432', 10),
    database: process.env['DB_NAME'] || 'matcha',
    user: process.env['DB_USER'] || 'matcha',
    password: process.env['DB_PASS'] || 'matcha',
});
