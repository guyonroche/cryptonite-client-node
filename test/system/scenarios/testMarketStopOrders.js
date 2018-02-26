const TestMarketStopOrders = (trader1, trader2, trader3) => {
  console.log('******************** Scenario 4 Test market stop orders  *********************');
  return trader1.init_state(trader1.config)
    .then(() => trader2.init_state(trader2.config))
    .then(() => trader3.init_state(trader3.config))
    .then(() => trader1.placeLimitOrderSpread(0.21, 1, 3, 0.01))
    .then(() => trader2.createOrder('', 'B', 0.25, 'S', 0.265))
    .then(() => trader2.createOrder('', 'S', 1, 'S', 0.235))
    .then(() => trader3.createOrder(0.25, 'B', 1, 'M'))
    .then(() => trader3.createOrder(0.25, 'S', 4, 'M'))
    .then(() => trader2.getMyOrders())
    .then(() => trader1.cancelAllOrders())
    .catch(error => {
      console.error(error.stack);
    });
};
module.exports = TestMarketStopOrders;
