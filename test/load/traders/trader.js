const Promish = require('promish');
const uuid = require('uuid');

const CryptoniteClient = require('../../../lib/cryptonite-client');

const isBuySide = (side) => side === 'B';


class Trader {
  constructor(config) {
    this.config = config;
    this.client = new CryptoniteClient(this.config);
  }

  initState() {
    this.orders = [];
    this.orderCount = 0;
    this.tradeCount = 0;
    this.orderIndex = {};
    this.transactionCount = 0;
  }

  initialise() {
    this.waiters = {};
    this.initState();
    this.client.on('message', m => {
      switch (m.msg) {
        case 'my-orders':
          this.orderCount += m.orders.length;
          m.orders.forEach(order => this._addMyOrder(order));

          break;
        case 'my-trades':
          this.tradeCount += m.trades.length;
          m.trades.forEach(trade => this.onTrade(trade));

          break;
        case 'my-transactions':
          this.transactionCount++;
          break;
      }
      // trigger all waiters...
      Object.values(this.waiters).forEach(trigger => {
        trigger();
      });
    });

    return this.client.connect();
  }

  onTrade() {}

  _addMyOrder(order) {
    // only keep track of open orders
    if (order.isOpen) {
      const index = this.orderIndex[order.orderId];
      if (index !== undefined) {
        this.orders[index] = order;
      } else {
        this.orderIndex[order.orderId] = this.orders.length;
        this.orders.push(order);
        this.orderCount++;
      }
    } else {
      this.orders = this.orders.filter(
        o => o.orderId !== order.orderId
      );
    }
  }

  waitFor(f, title, timeout = 10000) {
    const error = new Error(`Timed out waiting for ${title}`);
    return new Promish((resolve, reject) => {
      if (f()) {
        resolve();
        return;
      }
      const id = uuid.v4();
      const timer = setTimeout(() => {
        delete this.waiters[id];
        reject(error);
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

  hasOpenOrders(count) {
    return this.orders.filter(order => order.isOpen).length === count;
  }

  cleanUp() {
    // ensure trader has no open orders
    return this.client.getMyOrders()
      .then(({orders}) => {
        orders.forEach(order => this._addMyOrder(order));
        return this.client.cancelAllOrders();
      })
      .then(() => this.waitFor(
        () => this.orders.every(o => !o.isOpen),
        `${this.config.name} to have no open orders`
      ));
  }

  placeLimitOrder(market, side, quantity, price,  options = {} ) {
    this.getLastPriceAndQuantity(price, quantity, side);
    return this.createOrder({
      market,
      price,
      side,
      quantity,
      type: 'L',
    }, options);
  }

  placeMarketOrder(market, side, quantity, options) {
    if (isBuySide(side)) {
      return this.createOrder({
        market,
        side,
        value: quantity,
        type: 'M',
      }, options);
    } else {
      return this.createOrder({
        market,
        side,
        quantity,
        type: 'M',
      }, options);
    }
  }

  placeStopOrder(market, side, quantity, stop, options) {
    if (isBuySide(side)) {
      return this.createOrder({
        market,
        side,
        value: quantity,
        type: 'S',
        stop,
      }, options);
    } else {
      return this.createOrder({
        market,
        side,
        quantity,
        type: 'S',
        stop,
      }, options);
    }
  }

  placeStopLimitOrder(market, price, side, quantity, stop, options) {
    return this.createOrder({
      market,
      price,
      side,
      quantity,
      type: 'SL',
      stop,
    }, options);
  }

  placeLimitOrderSpread(market, price, quantity, count, margin) {
    const promises = [];
    for (let i = 1; i <= count; i++) {
      promises.push(
        this.createOrder({
          market,
          price: price + (i * margin),
          side: 'S',
          quantity,
          type: 'L',
        })
      );
      promises.push(
        this.createOrder({
          market,
          price: price - (i * margin),
          side: 'B',
          quantity,
          type: 'L',
        })
      );
    }
    return Promise.all(promises);
  }

  placeTrailingStopOrder(market, side, quantity, trailType, trail, options) {
    if(isBuySide(side)) {
      return this.createOrder({
        market,
        side,
        value: quantity,
        type: 'ST',
        trailType,
        trail,
      }, options);
    }
    else {
      return this.createOrder({
        market,
        side,
        quantity,
        type: 'ST',
        trailType,
        trail,
      }, options);
    }
  }

  createOrder(order, options ={}) {
    return this.client.createOrder(order)
      .then(
        result => {
          if (options.expectFail) {
            throw new Error('createOrder succeeded when expected to fail');
          }

          // add order to list
          order.orderId = result.orderId;
          order.isOpen = true;
          order.isBooked = false;
          this._addMyOrder(order);
        },
        error => {
          if (options.expectFail) {
            return;
          }
          throw error;
        }
      );
  }

  cancelAllOrders(market) {
    return this.client.cancelMarketOrders(market);
  }
}

module.exports = Trader;