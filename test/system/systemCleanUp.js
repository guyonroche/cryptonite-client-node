const Promish = require('promish');

const systemCleanUp = (traders) => {
  const promises = traders.map(trader => trader.cleanUp());
  return Promish.all(promises);
};

module.exports = systemCleanUp;