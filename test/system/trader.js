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
      let totalCost;
      const currentAssets = this.getBalance().assets; //ltc
      const currentCapital = this.getBalance().capital; //btc
      if(side === 'B') {
        totalCost = quantity * price;
        if (currentCapital <= 0.01 || totalCost > currentCapital) {
          console.log('Not enough capital to initiate order', this.config.name);
          resolve(true);
        }
        else {
          this.getLastBuyPriceAndQuantity(price, quantity, side);
          this.updateBalance('ASSETS', currentAssets + quantity);
          this.updateBalance('CAPITAL', currentCapital - totalCost);
          resolve(this.createOrder(price, side, quantity));
        }
      }
      else {
        if (currentAssets > 0 && quantity < currentAssets) {
          totalCost = quantity * price;
          this.getLastSellPriceAndQuantity(price, quantity, side);
          this.updateBalance('ASSETS', currentAssets - quantity);
          this.updateBalance('CAPITAL', currentCapital + totalCost);
          resolve(this.createOrder(price, side, quantity));
        }
        else {
          console.log("don't have an assets to sell", this.config.name);
          resolve(true);
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
    return this.client.createOrder(order)
      .then(() => {
        console.log((side === 'B' ? 'Buy' : 'Sell'), 'Quantity is', quantity, 'price is' , price, 'order placed', this.config.name);
      }).catch(err => {
        console.log(err);
      });
  }
}

module.exports = Trader;