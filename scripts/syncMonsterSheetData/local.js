require('dotenv').config();
const main = require('./main');

(async () => {
  const data = await main();
  const output = Object.keys(data).map((k) => `${data[k]?.length} ${k}`);
  console.log(`Successful sync! (${output.join(', ')})`);
})();
