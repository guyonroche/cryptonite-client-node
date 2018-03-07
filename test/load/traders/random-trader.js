const Promish = require('promish');
const Trader = require('./trader');
const strategyConfig = require('../random-strategy.json');

class RandomTrader extends Trader {

  start() {
    this.isActive = true;
    this.marketPrice = strategyConfig.price;
    const loop = () => {
      if (!this.isActive) {
        this.promise = Promish.resolve();
      } else {
        const random = (Math.random() * 2) - 1; // generate random number from -1 to 1
        if (random % 2 === 0) {
          this.marketPrice = this.marketPrice + (random * strategyConfig.random);
        } else {
          this.marketPrice = this.marketPrice - (random * strategyConfig.random);
        }
        this.promise = Promish.resolve()
          .then(() => this.cancelAllOrders(this.config.market))
          .then(() => this.placeLimitOrderSpread(this.config.market, this.marketPrice, 0.5, strategyConfig.orderCount, strategyConfig.orderDifference))
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

  onTrade(trade) {
    this.marketPrice = trade.price;
  }

  stop() {
    // stop the loop and wait for current iteration to complete
    this.isActive = false;
    return this.promise.then(() => this.cancelAllOrders(this.config.market))
  }
}

module.exports = RandomTrader;
