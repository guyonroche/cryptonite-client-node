const fs = require('fs');
const commander = require('commander');
const CryptoniteClient = require('../../lib/cryptonite-client');
const packageConfig = require('../../package');

const isBuySide = (side) => side === 'B';
// const isSellSide = (side) => side === 'S';

const isMarketOrder = (type) => ['M', 'S', 'ST'].includes(type);
// const isLimitOrder = (type) => ['L', 'SL', 'SLT'].includes(type);
const isStopOrder = (type) => type[0] === 'S';

commander
  .version(packageConfig.version)
  .arguments('<market> <side> <type> <quantity|value> [price]')
  .option('-x, --ext-id <id>', 'Customer supplied external id', null)
  .option('-s, --stop <value>', 'Stop value', parseFloat)
  .option('-c, --config <filename>', 'Config file', './config.json')
  .action((market, side, type, quantity, price, options) => {
    const order = {
      market,
      side,
      type,
    };
    if (options.extId) {
      order.extId = options.extId;
    }
    if (isMarketOrder(type)) {
      if (isBuySide(side)) {
        order.value = parseFloat(quantity);
      } else {
        order.quantity = parseFloat(quantity);
      }
    } else {
      order.quantity = parseFloat(quantity);
      order.price = parseFloat(price);
    }
    if (isStopOrder(type)) {
      if (!options.stop) {
        console.log('You must specify a stop value for stop orders');
        process.exit(1);
      }
      order.stop = options.stop;
    }
    console.log('order', JSON.stringify(order));

    const config = JSON.parse(fs.readFileSync(options.config));
    const client = new CryptoniteClient(config);

    client.createOrder(order)
      .then(result => {
        console.log(result);
      })
      .catch(error => {
        console.error(error.stack);
      });
  });

commander.parse(process.argv);
