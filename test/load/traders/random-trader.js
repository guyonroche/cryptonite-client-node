const Promish = require('promish');
const Trader = require('./trader');

class RandomTrader extends Trader {
  start() {
    this.isActive = true;
    const loop = () => {
      if (this.isActive) {
        this.promise = Promish.resolve()
          .then(() => this.config.price = Math.random())
          .delay(this.config.interval)
          .then(loop);
      } else {
        this.promise = Promish.resolve();
      }
    };
    loop();
  }

  stop() {
    // stop the loop and wait for current iteration to complete
    this.isActive = false;
    return this.cancelAllOrders(this.config.market)
      .then(() => this.placeLimitOrderSpread(this.config.market, this.config.price, 1, 5, 0.01))
      .catch(error => {
        // not expecting any errors
        console.error(error.stack);
        process.exit(1);
      });
  }
}

module.exports = RandomTrader;
