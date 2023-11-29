// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config();

// eslint-disable-next-line import/no-extraneous-dependencies
const { google } = require('googleapis');
const fs = require('fs');

const { SHEET_ID, SHEET_RANGE } = process.env;
const DATA_DIR = './src/data';
const MONSTER_FILE = 'monsters.json';

(async () => {
  const auth = await google.auth.getClient({ scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'] });
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: SHEET_RANGE,
  });

  const keys = response.data.values[0];
  const monsters = response.data.values
    .slice(1, -1).map((row) => row.reduce((monster, value, index) => {
      const key = keys[index];
      return {
        ...monster,
        [key]: value.includes('[') || /^\d+$/.test(value) ? JSON.parse(value) : value,
      };
    }, {}));
  if (!await fs.existsSync(DATA_DIR)) {
    await fs.mkdirSync(DATA_DIR);
  }
  await fs.writeFileSync(`${DATA_DIR}/${MONSTER_FILE}`, JSON.stringify(monsters, null, 2));
})();
