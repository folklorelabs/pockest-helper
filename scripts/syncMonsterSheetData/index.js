require('dotenv').config();
const functions = require('@google-cloud/functions-framework');
const main = require('./main');

functions.http('main', (req, res) => {
  (async () => {
    const data = await main();
    const output = Object.keys(data).map((k) => `${data[k]?.length} ${k}`);
    res.status(200).send(`Successful sync! (${output.join(', ')})`);
  })();
});
