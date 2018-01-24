const CryptoniteClient = require('../lib/cryptonite-client');
const config = require('../config.json');

const client = new CryptoniteClient(config);

const currency = process.argv[2];
const startDate = process.argv[3];
const endDate = process.argv[4];

client.getEquityCurve(currency, startDate, endDate)
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error(error.stack);
  });
