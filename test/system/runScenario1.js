const runScenario1 = (trader1) => {
  console.log('******************** Scenario 1 is started *********************');
  return trader1.placeOrder('S')
    .then(() => trader1.placeOrder('B'))
    .then(() => trader1.placeOrder('S'))
    .then(() => trader1.placeOrder('B'))
    .then(() => trader1.cancelAllOrders())
    .then(() => trader1.getCurrentBalance(trader1.config))
    .catch(error => {
      console.error(error.stack);
    });
};
module.exports = runScenario1;
