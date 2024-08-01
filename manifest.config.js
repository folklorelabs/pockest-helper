import { defineManifest } from '@crxjs/vite-plugin';
import { version } from './package.json';

export default defineManifest(() => ({
  manifest_version: 3,
  name: 'Pockest Helper',
  version: version.split('-')[0],
  version_name: version,
  content_scripts: [
    {
      matches: [
        'https://www.streetfighter.com/6/buckler/*minigame*',
      ],
      js: [
        'src/index.jsx',
      ],
    },
  ],
  icons: {
    32: 'src/assets/icon32.png',
    48: 'src/assets/icon48.png',
    128: 'src/assets/icon128.png',
  },
  browser_specific_settings: {
    gecko: {
      id: 'pockesthelper@folklorelabs.io',
      update_url: 'https://folklorelabs.io/pockest-helper/updateManifest.json',
    },
  },
}));
