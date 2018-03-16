const Promish = require('promish');

const run = (trader1, trader2) => {
  console.log('****************************************************************');
  console.log('** Scenario 3: Test Available Balance                         **');
  console.log('****************************************************************');

  return Promish.resolve()
    .then(() => trader2.getCurrentBalance())
    .then(() => trader2.placeLimitOrder('S', trader2.getBalance().assets + 25, 0.14, { expectFail: true,
      expectFailReason: 'not enough assets to sell' }))
    .then(() => trader2.placeLimitOrder('S', ((trader2.getBalance().assets/2)), 0.14))
    .then(() => trader2.placeLimitOrder('S', ((trader2.getBalance().assets * 2) * 3 / 4), 0.14, { expectFail: true,
      expectFailReason: 'not enough assets to sell' }))
    .then(() => trader2.cancelAllOrders())
    .then(() => trader2.getCurrentBalance())
    .then(() => trader2.placeLimitOrder('B', ((trader2.getBalance().capital / 0.12) + 25), 0.12, { expectFail: true,
      expectFailReason: 'enough capital to buy' }))
    .then(() => trader2.placeLimitOrder('B', (((trader2.getBalance().capital/0.12)/2)), 0.12))
    .then(() => trader2.placeLimitOrder('B', (((trader2.getBalance().capital * 2 / 0.12) * 3 / 4)), 0.12, { expectFail: true,
      expectFailReason: 'enough capital to buy' }))
    .then(() => trader2.cancelAllOrders())
    .then(() => trader2.getCurrentBalance());
};

module.exports = {
  index: 3,
  run,
};
