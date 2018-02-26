const TestMarketStopOrders = (trader1, trader2, trader3) => {
  console.log('******************** Scenario 4 Test market stop orders  *********************');
  return trader1.init_state(trader1.config)
    .then(() => trader2.init_state(trader2.config))
    .then(() => trader3.init_state(trader3.config))
    .then(() => trader1.placeLimitOrderSpread('B', 0.21, 1, 3, 0.01))
    .then(() => trader1.placeLimitOrderSpread('S', 0.25, 1, 3, 0.01))
    .then(() => trader2.createOrder((trader2.getLowestSellPrice(trader1.config, 'S') + 0.05), 'B',  0.25, 'S', 0.25))
    .then(() => trader2.createOrder((trader2.getMaxBuyPrice(trader1.config, 'B') - 0.05), 'S', 1, 'S', 0.25))
    .then(() => trader3.createOrder(0.25, 'B', 1, 'M'))
    .then(() => trader3.createOrder(0.25, 'S', 4, 'M'))
    .then(() => trader2.getMyOrders())
    .then(() => trader1.cancelAllOrders())
    .catch(error => {
      console.error(error.stack);
    });
};
module.exports = TestMarketStopOrders;
