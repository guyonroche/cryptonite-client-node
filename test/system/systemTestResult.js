const testSystem = (trader1, trader2) => {

  let isFailure;
  return trader1.showBalanceDetail(trader1.config).then(() => {
    const availableAssets = trader1.config.balance.available.assets;
    const availableCapital = trader1.config.balance.available.capital;
    const currentAssets = trader1.config.balance.current.assets;
    const currentCapital = trader1.config.balance.current.capital;

    let assetsDifference = availableAssets - currentAssets;
    let capitalDifference = availableCapital - currentCapital;

    isFailure = !(assetsDifference < 1e-8 && capitalDifference < 1e-8);

  })
    .then(() => trader2.showBalanceDetail(trader2.config)).then(() => {
      const availableAssets = trader2.config.balance.available.assets;
      const availableCapital = trader2.config.balance.available.capital;
      const currentAssets = trader2.config.balance.current.assets;
      const currentCapital = trader2.config.balance.current.capital;

      let assetsDifference = availableAssets - currentAssets;
      let capitalDifference = availableCapital - currentCapital;

      isFailure = !(assetsDifference < 1e-8 && capitalDifference < 1e-8);

      console.log('*************** system test result  **************** ');
      if(!isFailure) {
        console.log('System test is succeed');
      } else {
        console.log('system test is failed');
      }
    });

};
module.exports = testSystem;