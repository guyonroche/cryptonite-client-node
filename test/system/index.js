const trader = require('./trader');
const config = require('./config.json');
const traders = config.traders;
let tradersList  = {};

traders.forEach(config => {
  tradersList[config.name] = new trader(config);
});

