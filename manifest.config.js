import { defineManifest } from '@crxjs/vite-plugin';
import { version as versionName } from './package.json';

// Convert from Semver (example: 0.1.0-rc.6)
const [version, label = ''] = versionName.split('-');
const rcVersion = label.split('.')[1];

export default defineManifest(() => ({
  manifest_version: 3,
  name: 'Pockest Helper',
  version: !rcVersion ? version : `${version}.${rcVersion}`,
  version_name: versionName,
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
      id: !rcVersion ? 'pockesthelper@folklorelabs.io' : 'pockesthelper-beta@folklorelabs.io',
      update_url: 'https://folklorelabs.io/pockest-helper/updateManifest.json',
    },
  },
}));
