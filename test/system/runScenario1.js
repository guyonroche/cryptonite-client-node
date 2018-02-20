const runScenario1 = (trader1) => {
  console.log('******************** Scenario 1 is started *********************');
  return trader1.placeLimitOrder('B', 2, 0.10)
    .then(() => trader1.placeLimitOrder('B', 1, 0.10))
    .then(() => trader1.placeLimitOrder('S', 1, 0.13))
    .then(() => trader1.placeLimitOrder('S', 1, 0.13))
    .then(() => trader1.cancelAllOrders())
    .then(() => trader1.getCurrentBalance())
    .catch(error => {
      console.error(error.stack);
    });
};
module.exports = runScenario1;
