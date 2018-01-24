const CryptoniteClient = require('../lib/cryptonite-client');
const config = require('../config.json');

const client = new CryptoniteClient(config);

const secondary = process.argv[2];
const primary = process.argv[3];
const size = process.argv[4];
const start = process.argv[5];
const limit = process.argv[6];

client.getTradeHistory(secondary, primary, size, start, limit)
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error(error.stack);
  });
