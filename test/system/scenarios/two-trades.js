const systemUpdate = require('../systemUpdates');
const initTraders = require('../initTraders');

const run = (trader1, trader2) => {
  console.log('****************************************************************');
  console.log('** Scenario 2: Two Trades                                     **');
  console.log('****************************************************************');
  return initTraders(trader1, trader2)
    .then(() => trader1.placeLimitOrder('B', 1, 0.10))
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
    .then(() => trader1.cancelAllOrders())
    .then(() => trader2.cancelAllOrders())
    .catch(error => {
      console.error(error.stack);
    });
};

module.exports = {
  index: 2,
  run,
};
