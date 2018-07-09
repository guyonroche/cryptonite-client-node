const Promish = require('promish');

const run = (trader1, trader2) => {
  console.log('****************************************************************');
  console.log('** Scenario: One Trade                                        **');
  console.log('****************************************************************');
  return Promish.resolve()
    .then(() => trader1.placeLimitOrder('B', 0.1, 0.25))
    .then(() => trader2.placeMarketOrder('S', 1))
    .then(() => trader2.waitFor(() => trader1.trades.length, 'Trader 1 - first trade'))
    .then(() => trader2.waitFor(() => trader2.trades.length, 'Trader 2 - first trade'))
    .then(() => trader1.getCurrentBalance())
    .then(() => trader2.getCurrentBalance())
    .then(() => trader1.cancelAllOrders())
    .then(() => trader2.cancelAllOrders());
};

module.exports = {
  index: 15,
  run,
};
