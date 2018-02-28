const Promish = require('promish');

const run = (trader1, trader2, trader3) => {
  console.log('****************************************************************');
  console.log('** Scenario 4: Market Stop Orders                             **');
  console.log('****************************************************************');

  return Promish.resolve()
    .then(() => trader1.placeLimitOrderSpread(0.25, 1, 5, 0.01))
    .then(() => trader2.placeStopOrder('B', 0.25, 0.265))
    .then(() => trader2.placeStopOrder('S', 1, 0.235))
    .then(() => trader3.placeMarketOrder('B', 1))
    .then(() => trader3.placeMarketOrder('S', 4))
    .then(() => trader2.getMyOrders())
    .then(() => trader1.cancelAllOrders());
};

module.exports = {
  index: 4,
  run,
};
