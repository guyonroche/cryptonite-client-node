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

  init_state() {
    return this.client.connect()
      .then(() => this.getCurrentBalance());
  }

  getCurrentBalance() {
    return this.client.getBalances()
      .then(data => {
        const balanceData = data.balances;
        this.config.balance.assets = balanceData.ltc.availableBalance;
        this.config.balance.capital = balanceData.btc.availableBalance;
        this.logInitialDetail(this.config);
      });
  }

  logInitialDetail(config) {
    (logInitialDetails({
      config,
    }));
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

  placeLimitOrder(side, quantity, price,  options = {} ) {
    return new Promise((resolve) => {
      if(side === 'B') {
        this.getLastBuyPriceAndQuantity(price, quantity, side);
        resolve(this.createOrder(price, side, quantity, options));
      }
      else {
        this.getLastSellPriceAndQuantity(price, quantity, side);
        resolve(this.createOrder(price, side, quantity, options));
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

  createOrder(price, side, quantity, options ={}) {
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
      .then(
        () => {
          if (options.expectFail) {
            throw new Error('createOrder succeeded when expected to fail');
          }
          console.log((side === 'B' ? 'Buy' : 'Sell'), 'Quantity is', quantity, 'price is' , price, 'order placed', this.config.name);
        },
        error => {
          if (options.expectFail) {
            console.log('insufficient fund');
            return;
          }
          throw error;
        }
      );
  }
}

module.exports = Trader;