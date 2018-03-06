const Trader = require('./trader');

class SpreadAndCancelTrader extends Trader {

  start() {
    setInterval(() => {
      this.placeLimitOrderSpread(this.config.market,0.25, 0.5, 5, 0.01)
        .then(() => {
          return this.cancelAllOrders(this.config.market);
        });
    }, this.config.interval);
  }

  stop() {
    return new Promise((resolve) => {
      clearTimeout(this.config.interval);
      resolve(true);
    });
  }
}

module.exports = SpreadAndCancelTrader;