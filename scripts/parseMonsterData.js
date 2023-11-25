const fs = require('fs');
const csvToJson = require('convert-csv-to-json');

const MONSTER_CSV_PATH = './data/Pockest Helper - Export.csv';
const DATA_DIR = './src/data';
const MONSTER_FILE = 'monsters.json';

(async () => {
  const monsters = csvToJson
    .parseSubArray('*', '|')
    .formatValueByType()
    .fieldDelimiter(',')
    .getJsonFromCsv(MONSTER_CSV_PATH);
  if (!await fs.existsSync(DATA_DIR)) {
    await fs.mkdirSync(DATA_DIR);
  }
  await fs.writeFileSync(`${DATA_DIR}/${MONSTER_FILE}`, JSON.stringify(monsters, null, 2));
})();
