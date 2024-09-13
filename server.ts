import express from 'express';
import { join, resolve } from 'node:path';
import morgan from 'morgan';
import compression from 'compression';
import { promisify } from 'node:util';
import { apiRouter } from '@api/api';
import { sql } from '@api/connections/database.connection';

const PORT = Number.parseInt(process.env?.['APP_PORT'] ?? '4000');
const HOST = process.env?.['APP_HOST'] ?? 'localhost';

const IS_PRODUCTION = process.env?.['NODE_ENV'] === 'production';
const IS_DEVELOPMENT = !IS_PRODUCTION;

// The Express app is exported so that it can be used by serverless Functions.
export function start(): void {
    const app = express();

    if (IS_DEVELOPMENT) {
        apiRouter.use(morgan('dev')); // colorful logger
    }

    if (IS_PRODUCTION) {
        apiRouter.use(morgan('combined')); // logger

        // Compress responses
        app.use(compression());
    }

    // Express Rest API endpoints
    // app.use('/api', apiRouterOld);
    app.use('/api', apiRouter);

    if (IS_PRODUCTION) {
        const path = resolve(__dirname, 'matcha/browser');

        app.use(
            express.static(path, {
                maxAge: '1y',
            }),
        );

        app.get('**', function (req, res) {
            // Send the index.html file if the route is not found as the client-side router will handle the rest
            res.sendFile(join(path, 'index.html'));
        });
    }

    const server = app.listen(PORT, () => {
        console.log(`Server is running on http://${HOST}:${PORT}`);
    });

    // Configure graceful shutdown
    async function shutdown(reason: string) {
        console.log('Closing postgreSQL connection pool');
        await sql.end();

        console.debug(`Shutting down server: ${reason}`);
        await promisify(server.close.bind(server))();

        console.debug('Server has been shut down. Exiting process');
        process.exit(0);
    }

    // Handle signals for graceful shutdown
    process.on('SIGTERM', () => shutdown('SIGTERM signal received'));
    process.on('SIGINT', () => shutdown('SIGINT signal received'));
}

void start();
