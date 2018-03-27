const CryptoniteClient = require('../../lib/cryptonite-client');
const config = require('./config.json');

const client = new CryptoniteClient(config);

const currency = process.argv[2];
const start = process.argv[3];
const limit = process.argv[4];

client.getMyTransactions(currency, start, limit)
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error(error.stack);
  });
