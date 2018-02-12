const  CryptoniteClient = require('../../lib/cryptonite-client');
const logInitialDetails = require('./initilaLogger');

class Trader {

  constructor(config) {
    this.config = config;
    this.client = new CryptoniteClient(this.config);
    this.market = 'LTC/BTC';
    this.init_state(this.config);
  }

  init_state() {
    return new Promise((resolve)=> {
      this._myorders = {updated: undefined, data: undefined, errors: []};
      this.client.connect()
        .then(() => {
          this.client.getBalances()
            .then(data => {
              const balanceData = data.balances;
              this.config.balance.assets = balanceData.btc.availableBalance;
              this.config.balance.capital = balanceData.ltc.availableBalance;
              this.config.state.start.assets = balanceData.btc.availableBalance;
              this.config.state.start.capital = balanceData.ltc.availableBalance;
              this.logInitialDetails(this.config);
              return this.client.getMyOrders(1, 4);
            })
            .then((data) => {
              this._myorders.updated = new Date();
              this._myorders.data = data.orders;
              console.log('current orderd are : ', this._myorders);
              this.start_trading();
              resolve();
            })
            .catch(err =>{console.log(err);});
        });
    });

  }

  logInitialDetails(config) {
    logInitialDetails({
      config,
    });
  }

  start_trading() {
    return new Promise((resolve) => {
      this._execute_trading_strategy();
      resolve();
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

  cancelAllOrders() {
    let self = this;
    return new Promise((resolve) => {
      self.client.cancelMarketOrders(self.market)
        .then(() => {
          console.log('all orders are cancelled');
          self.logInitialDetails(self.config);
          process.exit();
          resolve();
        })
        .catch(err => {
          console.log(err.message);
        });
    });
  }

  _execute_trading_strategy() {
    let promises = [];
    let side;
    for (let i = 0; i < 4; i++) {
      side = i <= 1 ? 'B' : 'S';
      promises.push(this.placeOrder(side));
    }

    Promise.all(promises)
      .then(() => {
        this.cancelAllOrders();
      })
      .catch(err => {
        console.log(err);
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
          console.log('Not enough capital to initiate order');
          resolve(true);
        }
        else {
          this.updateBalance('ASSETS', currentAssets + calcCoins.coinsToBuy);
          this.updateBalance('CAPITAL', currentCapital - calcCoins.totalCost);
          resolve(this.createOrder(price, side, calcCoins.coinsToBuy));
        }
      }
      else {
        const maxAssetsToUse = currentAssets * (this.config.balance.maxAssetsToUse / 100);
        if (currentAssets > 0) {
          let assetsToSell = maxAssetsToUse;
          let totalCost = assetsToSell * price;
          this.updateBalance('ASSETS', currentAssets - assetsToSell);
          this.updateBalance('CAPITAL', currentCapital + totalCost);
          resolve(this.createOrder(price, side, assetsToSell));
        }
        else {
          console.log('don\'t have an assets to sell');
          resolve(true);
        }
      }
    });
  }

  createOrder(price, side, quantity) {
    return new Promise((resolve => {
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
          console.log((side === 'B' ? 'Buy' : 'Sell'), 'Amout is', quantity * price, 'order placed');
          resolve(true);
        }).catch(err => {
          console.log(err);
        });
    }));
  }

  calcMaxCoinsToBuy(price) {
    const currentCapital = this.getBalance().capital;
    const maxCapitalToUse = currentCapital * (this.config.balance.maxCapitalToUse / 100);
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