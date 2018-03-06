const Promish = require('promish');
const Trader = require('./trader');

class SpreadAndCancelTrader extends Trader {
  start() {
    this.isActive = true;
    const loop = () => {
      if (this.isActive) {
        this.promise = Promish.resolve()
          .then(() => this.placeLimitOrderSpread(this.config.market, 0.25, 0.5, 5, 0.01))
          .then(() => this.cancelAllOrders(this.config.market))
          .delay(this.config.interval)
          .then(loop)
          .catch(error => {
            // not expecting any errors
            console.error(error.stack);
            process.exit(1);
          });
      } else {
        this.promise = Promish.resolve();
      }
    };
    loop();
  }

  stop() {
    // stop the loop and wait for current iteration to complete
    this.isActive = false;
    return this.promise;
  }
}

module.exports = SpreadAndCancelTrader;
