import { defineConfig } from 'vitest/config';
import * as path from 'node:path';

export default defineConfig({
    resolve: {
        alias: {
            '@api': path.resolve(__dirname, 'src/api'),
        },
    },
});
