require('dotenv').config();
const fs = require('fs');
const fetchFromSheet = require('./syncMonsterSheetData/fetchFromSheet');

const DATA_DIR = './data';
const MONSTER_FILE = 'monsters.json';
const MONSTER_RANGE = 'Live!A:I';
const HASHES_FILE = 'hashes.json';
const HASHES_RANGE = 'LiveHashes!A:B';

(async () => {
  const monsters = await fetchFromSheet(MONSTER_RANGE);
  const hashes = await fetchFromSheet(HASHES_RANGE);
  if (!await fs.existsSync(DATA_DIR)) {
    await fs.mkdirSync(DATA_DIR);
  }
  await fs.writeFileSync(`${DATA_DIR}/${MONSTER_FILE}`, JSON.stringify(monsters));
  await fs.writeFileSync(`${DATA_DIR}/${HASHES_FILE}`, JSON.stringify(hashes));
})();
