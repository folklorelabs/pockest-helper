import 'dotenv/config';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.config';

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version),
    'import.meta.env.VITE_DISCORD_WEBHOOK_MATCH': JSON.stringify(process.env.VITE_DISCORD_WEBHOOK_MATCH),
    'import.meta.env.VITE_DISCORD_WEBHOOK_EVO': JSON.stringify(process.env.VITE_DISCORD_WEBHOOK_EVO),
    'import.meta.env.VITE_DISCORD_WEBHOOK_TEST': JSON.stringify(process.env.VITE_DISCORD_WEBHOOK_TEST),
  },
});
