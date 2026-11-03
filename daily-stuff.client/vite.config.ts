import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { env } from 'process';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        proxy: {
            '/api': {
                target: env.API_URL ?? 'http://localhost:5116',
                changeOrigin: true
            }
        },
        port: parseInt(env.DEV_SERVER_PORT || '18953')
    }
})
