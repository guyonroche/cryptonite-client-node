const Promish = require('promish');

const run = (trader1) => {
  console.log('****************************************************************');
  console.log('** Scenario 1: Spread and Cancel                              **');
  console.log('****************************************************************');
  return Promish.resolve()
    .then(() => trader1.placeLimitOrder('B', 2, 0.10))
    .then(() => trader1.placeLimitOrder('S', 1, 0.13))
    .then(() => trader1.placeLimitOrder('B', 1, 0.10))
    .then(() => trader1.placeLimitOrder('S', 1, 0.13))
    .then(() => trader1.waitFor(() => trader1.orders.length === 4, 'Trader1 has 4 orders'))
    .then(() => trader1.cancelOrderById(trader1.orders[0].orderId))
    .then(() => trader1.waitFor(() => !trader1.orders[0].isOpen, 'Order[0] is closed'))
    .then(() => trader1.cancelOrderById(trader1.orders[1].orderId))
    .then(() => trader1.waitFor(() => !trader1.orders[1].isOpen, 'Order[1] is closed'))
    .then(() => trader1.cancelOrderById(trader1.orders[2].orderId))
    .then(() => trader1.waitFor(() => !trader1.orders[2].isOpen, 'Order[2] is closed'))
    .then(() => trader1.cancelAllOrders())
    .then(() => trader1.waitFor(() => !trader1.orders[3].isOpen, 'Order[3] is closed'))
    .then(() => trader1.getCurrentBalance());
};

module.exports = {
  index: 1,
  run,
};
