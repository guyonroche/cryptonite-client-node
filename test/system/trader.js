const cryptoClient = require('../../lib/cryptonite-client');
const logInitialDetails = require('./initilaLogger');

class Trader {

  constructor(config) {
    this.config = config;
    this.client = new cryptoClient(this.config);
    this.market = 'LTC/BTC';
    this.init_state(this.config);
  }

  init_state() {
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
            console.log(this._myorders);
            this.start_trading();
          });
      });
  }

  logInitialDetails(config) {
    logInitialDetails({
      config,
    });
  }

  start_trading() {
    this._execute_trading_strategy();
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
    let self  = this;
    setTimeout(function() {
      self.client.cancelMarketOrders(self.market)
        .then(() => {
          console.log('all orders are cancelled');
          self.logInitialDetails(self.config);
          process.exit();
        })
        .catch(err => {
          console.log(err.message);
        });
    }, 100);
  }

  _execute_trading_strategy() {
    
    let side;
    return new Promise((resolve) => {
      for (let i = 0; i <= 3; i++) {
        side = i <= 1 ? 'B' : 'S';
        this.placeOrder(side);
      }
      resolve();
    })
      .then(()=>{
        return this.cancelAllOrders();
      });
  }

  placeOrder(side) {
    let price;
    price = side === 'B' ? 0.5 : 1.5;
    const currentAssets = this.getBalance().assets;
    const currentCapital = this.getBalance().capital;
    if (side === 'B') {
      let calcCoins = this.calcMaxCoinsToBuy(price);
      if (calcCoins.coinsToBuy === 0) {
        console.log('Not enough capital to initiate order');
      }
      else {
        this.createOrder(price, side, calcCoins);
      }
      this.updateBalance('ASSETS', currentAssets + calcCoins.coinsToBuy);
      this.updateBalance('CAPITAL', currentCapital - calcCoins.totalCost);
    }
    else {
      const maxAssetsToUse = currentAssets * (this.config.balance.maxAssetsToUse / 100);
      if (currentAssets > 0) {
        let assetsToSell = maxAssetsToUse;
        let totalCost = assetsToSell * price;
        this.updateBalance('ASSETS', currentAssets - assetsToSell);
        this.updateBalance('CAPITAL', currentCapital + totalCost);
        this.createOrder(price, side, assetsToSell);
      }
      else {
        console.log('don\'t have an assets to sell');
      }
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

    this.client.createOrder(order)
      .then(() => {
        console.log((side === 'B' ? 'Buy' : 'Sell'), 'Amout is', quantity * price, 'order placed');
      }).catch(err => {
        console.log(err);
      });
  }

  calcMaxCoinsToBuy(price) {
    
    const currentCapital = this.getBalance().capital;
    const maxCapitalToUse = currentCapital * (this.config.balance.maxCapitalToUse / 100);
    if (currentCapital <= 0.01) {
      // Not enough minimum capital to purchase from Exchange.
      console.log('Not enough capital to initiate order');
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