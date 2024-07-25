import express from 'express';
import { ApiRouter } from '@api/api';
import db from './src/api/connections/database';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
    const server = express();

    // Example Express Rest API endpoints

    server.use('/api', ApiRouter);

    return server;
}

async function run(): Promise<void> {
    const port = 8000;

    // Start up the Node server
    const server = app();

    await db.ready();

    server.listen(port, () => {
        console.log(
            `Node Express server listening on http://localhost:${port}`,
        );
    });

    process.on('SIGINT', async () => {
        await db.close();
        process.exit();
    });
}

void run();
