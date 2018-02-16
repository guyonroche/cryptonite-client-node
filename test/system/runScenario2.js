const systemUpdate = require('./systemUpdates');
const cleanUp = require('./systemCleanUp');

const runScenario2 = (trader1, trader2) => {
  console.log('******************** Scenario 2 is started *********************');
  return trader1.placeOrder('S')
    .then(() => trader1.placeOrder('B'))
    .then(() => trader1.placeOrder('S'))
    .then(() => trader1.placeOrder('B'))
    .then(() => trader2.placeOrder('S'))
    .then(() => systemUpdate(trader1, trader2))
    .then(() => trader1.getCurrentBalance(trader1.config))
    .then(() => trader2.getCurrentBalance(trader2.config))
    .then(() => trader2.placeOrder('B'))
    .then(() => trader1.getCurrentBalance(trader1.config))
    .then(() => trader2.getCurrentBalance(trader2.config))
    .then(() => cleanUp(trader1, trader2))
    .then(() => process.exit())
    .catch(error => {
      console.error(error.stack);
    });
};
module.exports = runScenario2;
