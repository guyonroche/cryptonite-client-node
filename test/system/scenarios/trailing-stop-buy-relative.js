const run = (trader1, trader2, trader3) => {
  console.log('****************************************************************');
  console.log('** Scenario 5: Trailing Stop Buy Relative                             **');
  console.log('****************************************************************');
  return trader1.init_state(trader1.config)
    .then(() => trader2.init_state(trader2.config))
    .then(() => trader3.init_state(trader3.config))
    .then(() => trader1.placeLimitOrderSpread(0.25, 0.5, 5, 0.01))
    //.then(() => trader2.placeTrailingStopOrder('B', 0.26, 'R', 0.05))
    .then(() => trader3.placeLimitOrder('B', 1, 0.26))
    .delay(1500)
    .then(() => trader1.getMyTrades())
    .then(() => trader3.getMyTrades())
    .then(() => trader3.placeLimitOrder('B', 1, 0.27))
    .delay(3000)
    .then(() => trader1.getMyTrades())
    .then(() => trader3.getMyTrades())
    .then(() => trader3.placeLimitOrder('B', 1, 0.28))
    .delay(3000)
    .then(() => trader1.getMyTrades())
    .then(() => trader3.getMyTrades())
    .then(() => trader3.placeLimitOrder('B', 1, 0.29))
    .delay(3000)
    .then(() => trader1.getMyTrades())
    .then(() => trader3.getMyTrades())
    .then(() => trader2.getMyOrders())
    .then(() => trader3.placeLimitOrder('S', 1, 0.29))
    .delay(3000)
    .then(() => trader1.getMyTrades())
    .then(() => trader3.getMyTrades())
    .then(() => trader3.placeLimitOrder('S', 1, 0.28))
    .delay(3000)
    .then(() => trader1.getMyTrades())
    .then(() => trader3.getMyTrades())
    .then(() => trader2.getMyOrders())
    .then(() => trader3.placeLimitOrder('S', 1, 0.27))
    .delay(3000)
    .then(() => trader1.getMyTrades())
    .then(() => trader3.getMyTrades())
    .delay(3000)
    .then(() => trader2.getMyOrders())
    .then(() => trader1.getMyTrades())
    .then(() => trader2.getMyTrades())
    .then(() => trader1.cancelAllOrders())
    .then(() => trader2.cancelAllOrders())
    .catch(error => {
      console.error(error.stack);
    });
};
module.exports = {
  index: 5,
  run,
};
