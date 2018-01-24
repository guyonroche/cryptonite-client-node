const CryptoniteClient = require('../lib/cryptonite-client');
const config = require('./config.json');

const client = new CryptoniteClient(config);

const currency = process.argv[2];

client.getCurrentEquity(currency)
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error(error.stack);
  });
