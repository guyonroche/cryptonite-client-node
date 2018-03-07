const Promish = require('promish');
const Trader = require('./trader');
const strategyConfig = require('../random-strategy.json');

class RandomTrader extends Trader {

  start() {
    this.isActive = true;

    const loop = () => {
      if (!this.isActive) {
        this.promise = Promish.resolve();
      } else {
        this.marketPrice = strategyConfig.price;
        let random = Math.round(Math.random(), 2);
        if (random % 2 === 0) {
          this.marketPrice = this.marketPrice + (random * strategyConfig.random);
        } else {
          this.marketPrice = this.marketPrice - (random * strategyConfig.random);
        }
        this.promise = Promish.resolve()
          .then(() => this.cancelAllOrders(this.config.market))
          .then(() => this.placeLimitOrderSpread(this.config.market, this.marketPrice, 0.5, 5, 0.01))
          .delay(this.config.interval)
          .then(loop)
          .catch(error => {
            // not expecting any errors
            console.error(error.stack);
            process.exit(1);
          });
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

module.exports = RandomTrader;
