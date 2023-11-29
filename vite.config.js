/* eslint-disable import/no-extraneous-dependencies */
import 'dotenv/config';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

console.log('asdf', process.env);

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(process.env.npm_package_version),
    'import.meta.env.DISCORD_WEBHOOK': JSON.stringify(process.env.DISCORD_WEBHOOK),
  },
});
