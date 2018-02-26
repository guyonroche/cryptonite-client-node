const run = (trader1) => {
  console.log('****************************************************************');
  console.log('** Scenario 1: Spread and Cancel                              **');
  console.log('****************************************************************');
  return trader1.init_state(trader1.config)
    .then(() => trader1.placeLimitOrder('B', 2, 0.10))
    .then(() => trader1.placeLimitOrder('B', 1, 0.10))
    .then(() => trader1.placeLimitOrder('S', 1, 0.13))
    .then(() => trader1.placeLimitOrder('S', 1, 0.13))
    .then(() => trader1.cancelAllOrders())
    .then(() => trader1.getCurrentBalance())
    .catch(error => {
      console.error(error.stack);
    });
};
module.exports = {
  index: 1,
  run,
};
