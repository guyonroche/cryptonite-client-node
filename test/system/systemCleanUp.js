const Promish = require('promish');

const systemCleanUp = (traders) => {
  const promises = traders.map(trader => trader.cancelAllOrders());
  return Promish.all(promises);
};
module.exports = systemCleanUp;