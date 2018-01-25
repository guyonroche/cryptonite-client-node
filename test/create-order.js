const CryptoniteClient = require('../lib/cryptonite-client');
const config = require('./config.json');

const market = process.argv[2];
const side = process.argv[3];
const type = process.argv[4];
const quantity = parseFloat(process.argv[5]);
const price = parseFloat(process.argv[6]);
const clientId = process.argv[7];

const order = {
  clientId,
  market,
  side,
  type,
  quantity,
  price,
};

const client = new CryptoniteClient(config);

client.createAnOrder(order)
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error(error.stack);
  });
