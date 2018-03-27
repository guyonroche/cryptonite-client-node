const CryptoniteClient = require('../../lib/cryptonite-client');
const config = require('./config.json');


const market = process.argv[2];
const orderId = process.argv[3];

const client = new CryptoniteClient(config);

client.cancelOrder(market, orderId)
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error(error.stack);
  });

