const initTraders = require('./initTraders');
const systemUpdate = require('./systemUpdates');

const runScenario2 = (trader1, trader2) => {
  return new Promise((resolve) => {
    trader2.placeOrder('S')
      .then(() => systemUpdate(trader1, trader2))
      .then(() => initTraders(trader1, trader2))
      .then(() => trader2.placeOrder('B'))
      .then(() => initTraders(trader1, trader2))
      .then(() => trader1.cancelAllOrders())
      .then(() => process.exit())
      .then(resolve(true))
      .catch(error => {
        console.error(error.stack);
      });
  });
};
module.exports = runScenario2;
