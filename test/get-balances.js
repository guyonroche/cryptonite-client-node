const CryptoniteClient = require('../lib/cryptonite-client');
const config = require('./config.json');

const client = new CryptoniteClient(config);

client.getBalances()
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error(error.stack);
  });
