const CryptoniteClient = require('../../lib/cryptonite-client');
const logInitialDetails = require('./initilaLogger');

let orderbook = {
  prices: [],
  quantities: []
};

let traders = {};

class Trader {

  constructor(config) {
    this.config = config;
    this.client = new CryptoniteClient(this.config);
    this.market = 'LTC/BTC';
  }

  init_state(config) {
    return this.client.connect()
      .then(() => this.getCurrentBalance(config));
  }

  getCurrentBalance(config) {
    return this.client.getBalances()
      .then(data => {
        const balanceData = data.balances;
        config.balance.assets = balanceData.ltc.availableBalance;
        config.balance.capital = balanceData.btc.availableBalance;
        (logInitialDetails({
          config,
        }));
      });
  }

  getBalance() {
    return {
      assets: this.config.balance.assets,
      capital: this.config.balance.capital,
    };
  }

  updateBalance(type, num) {
    if (type === 'CAPITAL') {
      this.config.balance.capital = num;
    } else if (type === 'ASSETS') {
      this.config.balance.assets = num;
    }
  }

  cancelAllOrders() {
    return this.client.cancelMarketOrders(this.market)
      .then(() => {
        console.log('all orders are cancelled for ', this.config.name);
      })
      .catch(err => {
        console.log(err.message);
      });
  }

  subscribeToMessages() {
    return new Promise((resolve) => {
      traders[this.config.name] =
        this.client.on('message', message => {
          if (message.msg !== 'open-markets') {
            console.log(JSON.stringify(message), this.config.name);
          }
        });
      resolve(true);
    });
  }

  placeOrder(side) {
    return new Promise((resolve) => {
      let price;
      let quantity = 1;
      let totalCost;
      price = side === 'B' ? 0.10 : 0.13;
      const currentAssets = this.getBalance().assets; //ltc
      const currentCapital = this.getBalance().capital; //btc
      // buy
      if (side === 'B') {
        if (currentCapital <= 0.01) {
          // Not enough minimum capital to purchase from Exchange.
          console.log('Not enough capital to initiate order', this.config.name);
          resolve(true);
        }
        else {
          if (this.config.name === 'trader2') {
            quantity = this.getQuantity()/2;
            price = 0.13;
          }
          totalCost = quantity * price;
          this.getLastBuyPriceAndQuantity(price, quantity);
          this.updateBalance('ASSETS', currentAssets + quantity);
          this.updateBalance('CAPITAL', currentCapital - totalCost);
          resolve(this.createOrder(price, side, quantity));
        }
      }
      // sell
      else {
        if (currentAssets > 0) {
          if (this.config.name === 'trader2') {
            quantity = this.getQuantity()/2;
          }
          totalCost = quantity * price;
          this.updateBalance('ASSETS', currentAssets - quantity);
          this.updateBalance('CAPITAL', currentCapital + totalCost);
          resolve(this.createOrder(price, side, quantity));
        }
        else {
          console.log('don\'t have an assets to sell', this.config.name);
          resolve(true);
        }
      }
    });
  }

  getQuantity() {
    let quntities = orderbook.quantities.map(q => {
      return q;
    });
    if (quntities.length) {
      return Math.max(...quntities);
    }
  }

  getLastBuyPriceAndQuantity(price, quantity) {
    if (this.config.name === 'trader1') {
      orderbook.prices.push(price);
      orderbook.quantities.push(quantity);
    }
  }

  createOrder(price, side, quantity) {
    const market = this.market;
    const type = 'L';
    const order = {
      market,
      side,
      type,
      quantity,
      price,
    };
    return this.client.createOrder(order)
      .then(() => {
        console.log((side === 'B' ? 'Buy' : 'Sell'), 'Qauntity is', quantity, 'price is' , price, 'order placed', this.config.name);
      }).catch(err => {
        console.log(err);
      });
  }
}

module.exports = Trader;