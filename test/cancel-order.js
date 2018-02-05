const CryptoniteClient = require('../lib/cryptonite-client');
const config = require('./config.json');


const orderId = process.argv[2];

const client = new CryptoniteClient(config);

client.cancelAnOrder(orderId)
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error(error.stack);
  });

