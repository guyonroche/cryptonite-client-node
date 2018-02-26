const CryptoniteClient = require('../../lib/cryptonite-client');
const logInitialDetails = require('./initilaLogger');
const balanceDetails = require('./balanceDetailLogger');

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
    return new Promise((resolve) => {
      if(side === 'B') {
        this.getLastBuyPriceAndQuantity(price, quantity, side);
        resolve(this.createOrder(price, side, quantity, 'L', options));
      }
      else {
        this.getLastSellPriceAndQuantity(price, quantity, side);
        resolve(this.createOrder(price, side, quantity, 'L', options));
      }
    });
  }

  placeLimitOrderSpread(side, price, quantity, count, margin) {
    return new Promise((resolve) => {
      for (let i=1; i<=count; i++) {
        if(side === 'B') {
          this.getLastBuyPriceAndQuantity(price, quantity, side);
          price = price - margin;
          resolve(this.createOrder(price, side, quantity, 'L'));
        }
        else {
          this.getLastSellPriceAndQuantity(price, quantity, side);
          price = price + margin;
          resolve(this.createOrder(price, side, quantity, 'L'));
        }
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

  getMaxBuyPrice(config, side) {
    let prices = orderbook[config.name][side].prices.map(p => {
      return p;
    });
    if(prices.length) {
      return Math.max(...prices);
    }
  }

  getLowestSellPrice(config, side) {
    let prices = orderbook[config.name][side].prices.map(p => {
      return p;
    });
    if(prices.length) {
      return Math.min(...prices);
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

  createOrder(price, side, quantity, type, options ={}) {
    const market = this.market;
    const order = {
      market,
      side,
      type,
      price,
    };

    const isBuySide = (side) => side === 'B';
    const isMarketOrder = (type) => ['M', 'S', 'ST'].includes(type);
    const isStopOrder = (type) => type[0] === 'S';

    if (isMarketOrder(type)) {
      if (isBuySide(side)) {
        order.value = quantity;
      } else {
        order.quantity = quantity;
      }
    } else {
      order.quantity = quantity;
      order.price = price;
    }
    if (isStopOrder(type)) {
      order.stop = 0.25;
    }

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

  getMyOrders() {
    return this.client.getMyOrders(1, 10)
      .then(data => {
        console.log('my orders ', data, this.config.name);
      });
  }
}

module.exports = Trader;