const CryptoniteClient = require('../../lib/cryptonite-client');
const config = require('./config.json');

const client = new CryptoniteClient(config);

const start = process.argv[2];
const limit = process.argv[3];


client.getMyTrades(start, limit)
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error(error.stack);
  });
