const run = (trader1, trader2, trader3) => {
  console.log('****************************************************************');
  console.log('** Scenario 4: Market Stop Orders                             **');
  console.log('****************************************************************');
  return trader1.init_state(trader1.config)
    .then(() => trader2.init_state(trader2.config))
    .then(() => trader3.init_state(trader3.config))
    .then(() => trader1.placeLimitOrderSpread(0.21, 1, 3, 0.01))
    .then(() => trader2.placeStopOrder('B', 0.25, 0.265))
    .then(() => trader2.placeStopOrder('S', 1, 0.235))
    .then(() => trader3.placeMarketOrder('B', 0.25))
    .then(() => trader3.placeMarketOrder('S', 4))
    .then(() => trader2.getMyOrders())
    .then(() => trader1.cancelAllOrders())
    .catch(error => {
      console.error(error.stack);
    });
};
module.exports = {
  index: 4,
  run,
};
