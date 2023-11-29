require('dotenv').config();
const functions = require('@google-cloud/functions-framework');
const { google } = require('googleapis');
const { Storage } = require('@google-cloud/storage');

const { SHEET_ID, SHEET_RANGE } = process.env;
const MONSTER_FILE = 'monsters.json';
const STORAGE = new Storage();
const PUBLIC_BUCKET = STORAGE.bucket('pockest-helper');
const CACHE_CONTROL = 'public, max-age=300'; // 3600 = 1 hr

let allUnknown = [];
async function fetchMonsters() {
  const auth = await google.auth.getClient({
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/devstorage.read_write',
    ],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: SHEET_RANGE,
  });

  const keys = response.data.values[0];
  const monsters = response.data.values
    .slice(1, -1).map((row) => row.reduce((monster, cellStr, index) => {
      const key = keys[index];
      const value = cellStr.includes('[') ? JSON.parse(cellStr) : cellStr;
      if (['matchSusFever', 'matchSusNormal', 'matchUnknown'].includes(key)) allUnknown = [...allUnknown, ...value]; // for fun!
      return {
        ...monster,
        [key]: value,
      };
    }, {}));
  return monsters;
}

async function uploadToCloud(monsters) {
  const destMeta = PUBLIC_BUCKET.file(MONSTER_FILE);
  await destMeta.save(JSON.stringify(monsters));
  await destMeta.setMetadata({
    cacheControl: CACHE_CONTROL,
    contentType: 'application/json',
  });
}

async function getMonstersFromCloud() {
  const buffer = await PUBLIC_BUCKET.file(MONSTER_FILE).download();
  const monsters = JSON.parse(buffer);
  return monsters;
}

functions.http('main', (req, res) => {
  (async () => {
    const monsters = await fetchMonsters();
    await uploadToCloud(monsters);
    res.status(200).send(`Success! (${allUnknown.length} match-ups left to discover)`);
  })();
});
