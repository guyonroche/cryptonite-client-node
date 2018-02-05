const CryptoniteClient = require('../lib/cryptonite-client');
const config = require('./config.json');


const market = process.argv[2];

const client = new CryptoniteClient(config);

client.cancelMarketOrders(market)
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error(error.stack);
  });

