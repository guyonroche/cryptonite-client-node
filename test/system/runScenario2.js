const systemUpdate = require('./systemUpdates');
const cleanUp = require('./systemCleanUp');

const runScenario2 = (trader1, trader2) => {
  console.log('******************** Scenario 2 is started *********************');
  return trader1.placeLimitOrder('B', 1, 0.10)
    .then(() => trader1.placeLimitOrder('B', 1, 0.10))
    .then(() => trader1.placeLimitOrder('S', 0.5, 0.13))
    .then(() => trader1.placeLimitOrder('S', 0.5, 0.13))
    .then(() => { trader2.placeLimitOrder('S', trader1.getQuantity(trader1.config, 'B')/2 , 0.13); })
    .then(() => systemUpdate(trader1, trader2))
    .then(() => trader1.getCurrentBalance())
    .then(() => trader2.getCurrentBalance())
    .then(() => { trader2.placeLimitOrder('B', trader1.getQuantity(trader1.config, 'B')/2, 0.13); })
    .then(() => trader1.getCurrentBalance())
    .then(() => trader2.getCurrentBalance())
    .then(() => cleanUp(trader1, trader2))
    .catch(error => {
      console.error(error.stack);
    });
};
module.exports = runScenario2;
