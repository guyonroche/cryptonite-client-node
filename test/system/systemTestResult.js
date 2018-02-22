const Promish = require('promish');

const testSystem = (traders) => {
  const promises = traders.map(trader => {
    return trader.showBalanceDetail(trader.config)
      .then(() => {
        const availableAssets = trader.config.balance.available.assets;
        const availableCapital = trader.config.balance.available.capital;
        const currentAssets = trader.config.balance.current.assets;
        const currentCapital = trader.config.balance.current.capital;

        let assetsDifference = Math.abs(availableAssets - currentAssets);
        let capitalDifference = Math.abs(availableCapital - currentCapital);

        if ((assetsDifference > 1e-8) || (capitalDifference > 1e-8)) {
          throw new Error(`${trader.name} current and available balances do not match`);
        }
      });
  });
  return Promish.all(promises);
};
module.exports = testSystem;