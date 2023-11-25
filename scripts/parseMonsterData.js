const fs = require('fs');
// eslint-disable-next-line import/no-extraneous-dependencies
const csvToJson = require('convert-csv-to-json');

const MONSTER_CSV_PATH = './data/Pockest Helper - Monsters.csv';
const MONSTER_PATH = './src/data/monsters.json';

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
  await fs.writeFileSync(MONSTER_PATH, JSON.stringify(cleanMonsters, null, 2));
})();
