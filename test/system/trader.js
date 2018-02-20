const CryptoniteClient = require('../../lib/cryptonite-client');
const logInitialDetails = require('./initilaLogger');

let orderbook = {};

class Trader {

  constructor(config) {
    this.config = config;
    this.client = new CryptoniteClient(this.config);
    this.market = 'LTC/BTC';
    orderbook[this.config.name] = { 'B' : { prices: [], quantities: [] }, 'S' : { prices: [], quantities: [] }};
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
      this.client.on('message', message => {
        if (message.msg !== 'open-markets') {
          console.log(JSON.stringify(message), this.config.name);
        }
      });
      resolve(true);
    });
  }

  placeLimitOrder(side, quantity, price) {
    return new Promise((resolve) => {
      if(side === 'B') {
        this.getLastBuyPriceAndQuantity(price, quantity, side);
        resolve(this.createOrder(price, side, quantity));
      }
      else {
        this.getLastSellPriceAndQuantity(price, quantity, side);
        resolve(this.createOrder(price, side, quantity));
      }
    });
  }

  getQuantity(config, side) {
    let quntities = orderbook[config.name][side].quantities.map(q => {
      return q;
    });
    if (quntities.length) {
      return Math.max(...quntities);
    }
  }

  getLastSellPriceAndQuantity(price, quantity, side) {
    orderbook[this.config.name][side].prices.push(price);
    orderbook[this.config.name][side].quantities.push(quantity);
  }

  getLastBuyPriceAndQuantity(price, quantity, side) {
    orderbook[this.config.name][side].prices.push(price);
    orderbook[this.config.name][side].quantities.push(quantity);
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
    return new Promise((resolve, reject) => {
      this.client.createOrder(order)
        .then(() => {
          console.log((side === 'B' ? 'Buy' : 'Sell'), 'Quantity is', quantity, 'price is' , price, 'order placed', this.config.name);
          resolve(true);
        }).catch(err => {
          reject(err);
        });
    });
  }
}

module.exports = Trader;