require('dotenv').config();
const fetchFromSheet = require('./fetchFromSheet');
const uploadToCloud = require('./uploadToCloud');

const MONSTER_FILE = 'monsters.json';
const MONSTER_RANGE = 'Live!A:I';
const HASHES_FILE = 'hashes.json';
const HASHES_RANGE = 'LiveHashes!A:B';

async function main() {
  const monsters = await fetchFromSheet(MONSTER_RANGE);
  await uploadToCloud(monsters, MONSTER_FILE);
  const hashes = await fetchFromSheet(HASHES_RANGE);
  await uploadToCloud(hashes, HASHES_FILE);
  return { monsters, hashes };
}

module.exports = main;
