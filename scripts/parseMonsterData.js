const fs = require('fs');
// eslint-disable-next-line import/no-extraneous-dependencies
const csvToJson = require('convert-csv-to-json');

const MONSTER_CSV_PATH = './data/Pockest Helper - Monsters.csv';
const DATA_DIR = './src/data';
const MONSTER_FILE = 'monsters.json';

(async () => {
  const monsters = csvToJson
    .parseSubArray('*', '|')
    .formatValueByType()
    .fieldDelimiter(',')
    .getJsonFromCsv(MONSTER_CSV_PATH);
  const cleanMonsters = monsters.map((m) => ({
    monster_id: m.monster_id,
    name_en: m.name_en,
    plan: m.plan,
    matchFever: m.matchFever,
  }));
  if (!await fs.existsSync(DATA_DIR)) {
    await fs.mkdirSync(DATA_DIR);
  }
  await fs.writeFileSync(`${DATA_DIR}/${MONSTER_FILE}`, JSON.stringify(cleanMonsters, null, 2));
})();
