const Promish = require('promish');
const uuid = require('uuid');

const CryptoniteClient = require('../../lib/cryptonite-client');
const logInitialDetails = require('./initilaLogger');
const balanceDetails = require('./balanceDetailLogger');

const isBuySide = (side) => side === 'B';
// const isMarketOrder = (type) => ['M', 'S', 'ST'].includes(type);

let orderbook = {};

class Trader {
  constructor(config) {
    this.config = config;
    this.client = new CryptoniteClient(this.config);
    this.market = 'LTC/BTC';
    orderbook[this.config.name] = { 'B' : { prices: [], quantities: [] }, 'S' : { prices: [], quantities: [] }};
  }

  initialise() {
    this.waiters = {};
    this.initState();
    this.client.on('message', m => {
      console.log('message', JSON.stringify(m));
      switch (m.msg) {
        case 'my-orders':
          m.orders.forEach(order => {
            const index = this.orderIndex[order.orderId];
            if (index !== undefined) {
              this.orders[index] = order;
            } else {
              this.orderIndex[order.orderId] = this.orders.length;
              this.orders.push(order);
            }
          });

          break;
        case 'my-trades':
          m.trades.forEach(trade => {
            const index = this.tradeIndex[trade.tradeId];
            if (index !== undefined) {
              this.trades[index] = trade;
            } else {
              this.tradeIndex[trade.tradeId] = this.trades.length;
              this.trades.push(trade);
            }
          });
          break;
        case 'my-transactions':
          m.transactions.forEach(transaction => {
            const index = this.transactionIndex[transaction.transactionId];
            if (index !== undefined) {
              this.transactions[index] = transaction;
            } else {
              this.transactionIndex[transaction.transactionId] = this.transactions.length;
              this.transactions.push(transaction);
            }
          });
          break;
      }
      // trigger all waiters...
      Object.values(this.waiters).forEach(trigger => {
        trigger();
      });
    });

    return this.client.connect();
  }

  waitFor(f, title, timeout = 20000) {
    console.log('Waiting for', title);
    return new Promish((resolve, reject) => {
      if (f()) {
        resolve();
        return;
      }
      const id = uuid.v4();
      const timer = setTimeout(() => {
        delete this.waiters[id];
        reject(new Error(`Timed out waiting for ${title}`));
      }, timeout);
      this.waiters[id] = () => {
        if (f()) {
          clearTimeout(timer);
          delete this.waiters[id];
          resolve();
        }
      };
    });
  }

  expectMatchingTrade(quantity, price) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if(this.trades && this.trades.length !== 0) {
          let tradeClone =  JSON.parse(JSON.stringify(this.trades));
          for (let i = 0; i < tradeClone.length; i++) {
            if ((tradeClone[i].quantity === quantity && tradeClone[i].price === price)) {
              console.log('found trade of', quantity, 'at', price, 'for', this.config.name);
              return resolve(true);
            }
          }
          console.log('not found trade of' , quantity, 'at', price, 'for', this.config.name);
        }
      }, 700);
    });
  }

  checkOpenOrder() {
    return new Promise((resolve) => {
      if(this.orders && this.orders.length !== 0) {
        let orderClone =  JSON.parse(JSON.stringify(this.orders));
        for (let i = 0; i < orderClone.length; i++) {
          if (!orderClone[i].isBooked) {
            console.log('found one open order', this.config.name);
            return resolve(true);
          }
        }
      }
    });
  }

  initState() {
    this.trades = [];
    this.tradeIndex = {};
    this.orders = [];
    this.orderIndex = {};
    this.transactions = [];
    this.transactionIndex = {};
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
    console.log(`Cancelling ${this.market} Market orders for`, this.config.name);
    return this.client.cancelMarketOrders(this.market);
  }

  cancelOrderById(orderId) {
    console.log('Cancelling Order', orderId);
    return this.client.cancelOrder(orderId);
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

  placeTrailingStopOrder(side, quantity, trailType, trail, options) {
    if(isBuySide(side)) {
      return this.createOrder({
        side,
        value: quantity,
        type: 'ST',
        trailType,
        trail,
        stop: trail,
      }, options);
    }
    else {
      return this.createOrder({
        side,
        quantity,
        type: 'ST',
        trailType,
        trail,
        stop: trail,
      }, options);
    }
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
            console.log('Create Order failed but this was expected.');
            return;
          }
          throw error;
        }
      );
  }

  getMyOrders() {
    return this.client.getMyOrders()
      .then(data => {
        console.log('my orders ', data, this.config.name);
      });
  }
}

module.exports = Trader;