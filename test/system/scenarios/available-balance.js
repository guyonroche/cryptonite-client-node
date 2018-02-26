const run = (trader1, trader2) => {
  console.log('****************************************************************');
  console.log('** Scenario 3: Test Available Balance                         **');
  console.log('****************************************************************');
  return trader2.init_state(trader2.config)
    .then(() => trader2.placeLimitOrder('S', trader2.getBalance().assets + 25, 0.14, { expectFail: true }))
    .then(() => trader2.placeLimitOrder('S', ((trader2.getBalance().assets/2)), 0.14))
    .then(() => trader2.placeLimitOrder('S', ((trader2.getBalance().assets * 2) * 3 / 4), 0.14, { expectFail: true }))
    .then(() => trader2.cancelAllOrders())
    .then(() => trader2.getCurrentBalance())
    .then(() => trader2.placeLimitOrder('B', ((trader2.getBalance().capital / 0.12) + 25), 0.12, { expectFail: true }))
    .then(() => trader2.placeLimitOrder('B', (((trader2.getBalance().capital/0.12)/2)), 0.12))
    .then(() => trader2.placeLimitOrder('B', (((trader2.getBalance().capital * 2 / 0.12) * 3 / 4)), 0.12, { expectFail: true }))
    .then(() => trader2.cancelAllOrders())
    .then(() => trader2.getCurrentBalance())
    .catch(error => {
      console.error(error.stack);
    });
};
module.exports = {
  index: 3,
  run,
};
