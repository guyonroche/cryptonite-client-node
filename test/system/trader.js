const CryptoniteClient = require('../../lib/cryptonite-client');
const logInitialDetails = require('./initilaLogger');
const balanceDetails = require('./balanceDetailLogger');

const isBuySide = (side) => side === 'B';
const isMarketOrder = (type) => ['M', 'S', 'ST'].includes(type);

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
        this.config.balance.available.assets = balanceData.ltc.availableBalance;
        this.config.balance.available.capital = balanceData.btc.availableBalance;
        this.config.balance.current.assets = balanceData.ltc.availableBalance;
        this.config.balance.current.capital = balanceData.btc.availableBalance;
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
      assets: this.config.balance.available.assets,
      capital: this.config.balance.available.capital,
    };
  }

  showBalanceDetail(config) {
    return this.getCurrentBalance()
      .then(() => {
        (balanceDetails({
          config,
        }));
      });
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
    this.getLastPriceAndQuantity(price, quantity, side);
    return this.createOrder({
      price,
      side,
      quantity,
      type: 'L',
    }, options);
  }

  placeMarketOrder(side, quantity, options) {
    if (isBuySide(side)) {
      return this.createOrder({
        side,
        value: quantity,
        type: 'M',
      }, options);
    } else {
      return this.createOrder({
        side,
        quantity,
        type: 'M',
      }, options);
    }
  }

  placeStopOrder(side, quantity, stop, options) {
    if (isBuySide(side)) {
      return this.createOrder({
        side,
        value: quantity,
        type: 'S',
        stop,
      }, options);
    } else {
      return this.createOrder({
        side,
        quantity,
        type: 'S',
        stop,
      }, options);
    }

  }

  placeLimitOrderSpread(price, quantity, count, margin) {
    const promises = [];
    for (let i = 1; i <= count; i++) {
      promises.push(
        this.createOrder({ price: price + (i * margin), side: 'S', quantity, type: 'L'})
      );
      promises.push(
        this.createOrder({ price: price - (i * margin), side: 'B', quantity, type: 'L'})
      );
    }
    return Promise.all(promises);
  }

  getQuantity(config, side) {
    let quntities = orderbook[config.name][side].quantities.map(q => {
      return q;
    });
    if (quntities.length) {
      return Math.max(...quntities);
    }
  }

  getLastPriceAndQuantity(price, quantity, side) {
    orderbook[this.config.name][side].prices.push(price);
    orderbook[this.config.name][side].quantities.push(quantity);
  }

  createOrder(order, options ={}) {
    order.market = this.market;

    return this.client.createOrder(order)
      .then(
        () => {
          if (options.expectFail) {
            throw new Error('createOrder succeeded when expected to fail');
          }
          console.log((order.side === 'B' ? 'Buy' : 'Sell'), 'Quantity is', order.quantity, 'price is' , order.price, 'order placed', this.config.name);
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

  getMyOrders() {
    return this.client.getMyOrders(1, 10)
      .then(data => {
        console.log('my orders ', data, this.config.name);
      });
  }
}

module.exports = Trader;