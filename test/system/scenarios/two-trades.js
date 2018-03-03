const Promish = require('promish');

const run = (trader1, trader2) => {
  console.log('****************************************************************');
  console.log('** Scenario 2: Two Trades                                     **');
  console.log('****************************************************************');
  return Promish.resolve()
    .then(() => trader1.placeLimitOrderSpread(0.25, 1, 3, 0.01))
    .then(() => trader2.placeMarketOrder('S', 1))
    .then(() => trader2.waitFor(() => trader2.trades.length, 'Trader 2 - first trade'))
    .then(() => trader2.placeMarketOrder('B', 0.25))
    .then(() => trader2.waitFor(() => trader2.trades.length > 1, 'Trader 2 - second trade'))
    .then(() => trader1.getCurrentBalance())
    .then(() => trader2.getCurrentBalance())
    .then(() => trader1.cancelAllOrders())
    .then(() => trader2.cancelAllOrders());
};

module.exports = {
  index: 2,
  run,
};
