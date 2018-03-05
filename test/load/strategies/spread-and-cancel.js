const Promish = require('promish');

module.exports = class SpreadAndCancel {
  constructor(strategyConfig, config) {
    // configuration about this strategy
    this.strategyConfig = strategyConfig;

    // configuration about the server and traders.
    this.config = config;
  }

  initialise() {
    this.traders = [];

    // using the two config files, create all the traders and initialise
    const promises = this.config.traders.map(traderConfig => {
      const config = {
        ...this.config.server,
        ...traderConfig,
        market: this.config.markets[0],
      };

      const trader = new SpreadAndCancelTrader(config);
      this.traders.push(trader);
      return trader.initialise();
    });
    return Promish.all(promises);
  }

  start() {
    // start the load test and resolve when running
  }

  stop() {
    // start the load test and resolve when all traders are stopped and
    // all orders cancelled.
  }

  report() {
    // console.log results of the test, e.g. how many orders were
    // successfully created/cancelled totalled across all traders.
  }
};
