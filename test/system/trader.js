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
    this.client.connect()
      .then(() => {});
  }

  init_state(config) {
    return new Promise((resolve) => {
      this.client.getBalances()
        .then(data => {
          const balanceData = data.balances;
          config.balance.assets = balanceData.btc.availableBalance;
          config.balance.capital = balanceData.ltc.availableBalance;
          config.state.start.assets = balanceData.btc.availableBalance;
          config.state.start.capital = balanceData.ltc.availableBalance;
          return resolve(this.logInitialDetails(config));
        });
    });
  }

  logInitialDetails(config) {
    logInitialDetails({
      config,
    });
  }

  getBalance() {
    return {
      assets: this.config.balance.assets,
      capital: this.config.balance.capital,
      start: {
        assets: this.config.state.start.assets,
        capital: this.config.state.start.capital,
        price: this.config.state.start.price,
      }
    };
  }

  updateBalance(type, num) {
    if (type === 'CAPITAL') {
      this.config.balance.capital = num;
    } else if (type === 'ASSETS') {
      this.config.balance.assets = num;
    }
  }

  // execute buy-2/sell-2 orders for trader1
  runScenario1() {
    let promises = [];
    let side;
    for (let i = 0; i < 4; i++) {
      side = i <= 1 ? 'B' : 'S';
      promises.push(this.placeOrder(side));
    }
    return Promise.all(promises);
  }

  cancelAllOrders() {
    return new Promise((resolve, reject) => {
      this.client.cancelMarketOrders(this.market)
        .then(() => {
          console.log('all orders are cancelled for ', this.config.name);
          process.exit();
          return resolve(true);
        })
        .catch(err => {
          console.log(err.message);
          return reject(false);
        });
    });
  }

  subscribeToMessages() {
    return new Promise((resolve) => {
      traders[this.config.name] =
        this.client.on('message', message => {
          if (message.msg !== 'open-markets') {
            console.log(JSON.stringify(message), this.config.name);
            resolve(true);
          }
        });
      return resolve(true);
    });
  }

  placeOrder(side) {
    return new Promise((resolve) => {
      let price;
      price = side === 'B' ? 0.000005 : 0.00005;
      const currentAssets = this.getBalance().assets;
      const currentCapital = this.getBalance().capital;
      if (side === 'B') {
        let calcCoins = this.calcMaxCoinsToBuy(price);
        if (calcCoins.coinsToBuy === 0) {
          console.log('Not enough capital to initiate order', this.config.name);
          return resolve(true);
        }
        else {
          this.updateBalance('ASSETS', currentAssets + calcCoins.coinsToBuy);
          this.updateBalance('CAPITAL', currentCapital - calcCoins.totalCost);
          this.getLastBuyPriceAndQuantity(price, calcCoins.coinsToBuy);
          return resolve(this.createOrder(price, side, calcCoins.coinsToBuy));
        }
      }
      else {
        const maxAssetsToUse = currentCapital * (this.config.balance.maxAssetsToUse / 100);
        if (maxAssetsToUse > 0) {
          if (this.config.name === 'trader2') {
            let quntities = orderbook.quantities.map(q => {
              return q;
            });

            if (quntities.length) {

              const assetsToSell = Math.max(...quntities);
              if (assetsToSell < currentCapital) {
                let totalCost = assetsToSell * price;
                this.updateBalance('ASSETS', currentAssets - assetsToSell);
                this.updateBalance('CAPITAL', currentCapital + totalCost);
                resolve(this.createOrder(price, side, assetsToSell / 2));
              }
              else {
                console.log('don\'t have enough assets to sell', this.config.name);
                resolve(true);
              }
            }
          }
          else {
            let assetsToSell = maxAssetsToUse;
            let totalCost = assetsToSell * price;
            this.updateBalance('ASSETS', currentAssets - assetsToSell);
            this.updateBalance('CAPITAL', currentCapital + totalCost);
            resolve(this.createOrder(price, side, assetsToSell));
          }
        }
        else {
          console.log('don\'t have an assets to sell', this.config.name);
          return resolve(true);
        }
      }
    });
  }

  getLastBuyPriceAndQuantity(price, quantity) {
    if (this.config.name === 'trader1') {
      orderbook.prices.push(price);
      orderbook.quantities.push(quantity);
      this.config.state.last.price = price;
      this.config.state.last.quantity = quantity;
    }
  }

  createOrder(price, side, quantity) {
    return new Promise((resolve, reject) => {
      const market = this.market;
      const type = 'L';
      const order = {
        market,
        side,
        type,
        quantity,
        price,
      };
      this.client.createOrder(order)
        .then(() => {
          console.log((side === 'B' ? 'Buy' : 'Sell'), 'Amout is', quantity * price, 'order placed', this.config.name);
          resolve(true);
        }).catch(err => {
          console.log(err);
          reject(false);
        });
    });
  }

  calcMaxCoinsToBuy(price) {
    const currentCapital = this.getBalance().capital;
    const maxCapitalToUse = currentCapital * (this.config.balance.maxCapitalToUse / 10000);
    if (currentCapital <= 0.01) {
      // Not enough minimum capital to purchase from Exchange.
      return {
        coinsToBuy: 0,
        totalCost: 0
      };
    }

    let totalCost;
    let coinsToBuy = Math.floor(maxCapitalToUse / price);

    let foundCoins = false;
    while (!foundCoins) {
      totalCost = (coinsToBuy * price);
      if (totalCost >= currentCapital) {
        console.log('Too many coins', coinsToBuy);
        coinsToBuy--;
      } else {
        foundCoins = true;
      }
    }
    return {
      coinsToBuy,
      totalCost
    };
  }
}

module.exports = Trader;