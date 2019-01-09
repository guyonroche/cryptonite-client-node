const fs = require('fs');
const commander = require('commander');
const CryptoniteClient = require('../../lib/cryptonite-client');
const packageConfig = require('../../package');

commander
  .version(packageConfig.version)
  .option('-c, --config <filename>', 'Config file', './config.json')
  .option('-o, --orderId <order-id>', 'Order Id')
  .option('-m, --market <market>', 'Cancel market orders')
  .option('-a, --all', 'Cancel all orders', false)
  .option('-v, --verbose', 'Verbose', false);

commander.parse(process.argv);

const config = JSON.parse(fs.readFileSync(commander.config));
const client = new CryptoniteClient(config);

let promise;
if (commander.orderId) {
  promise = client.cancelOrder(commander.orderId);
} else if (commander.market) {
  promise = client.cancelMarketOrders(commander.market);
} else if (commander.all) {
  promise = client.cancelAllOrders();
} else {
  console.log('Nothing to cancel');
  process.exit(0);
}

promise
  .then(result => {
    console.log(JSON.stringify(result));
  })
  .catch(error => {
    console.error(error.stack);
  });

