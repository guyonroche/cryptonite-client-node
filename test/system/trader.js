const  CryptoniteClient = require('../../lib/cryptonite-client');
const logInitialDetails = require('./initilaLogger');
const config = require('./config.json');

let allConfig = config.traders;
let timer;

let orderbook = {
  prices : [],
  quantities : []
};

let traders = {};
class Trader {

  constructor(config) {
    this.config = config;
    this.client = new CryptoniteClient(this.config);
    this.market = 'LTC/BTC';
    this.init_state(this.config);
  }

  init_state() {
    return new Promise((resolve)=> {
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
              setTimeout(()=>{
                this.start_trading();
              }, 500);
              resolve();
            });
        });
    });
  }

  logInitialDetails(config) {
    return new Promise((resolve) =>{
      logInitialDetails({
        config,
      });
      resolve();
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
    return new Promise((resolve) => {
      if(this.config.name === 'trader1') {
        this.client.cancelMarketOrders(this.market)
          .then(() => {
            console.log('all orders are cancelled for ', this.config.name);
            allConfig.forEach(config => {
              this.logInitialDetails(config);
            });
            process.exit();
            resolve();
          })
          .catch(err => {
            console.log(err.message);
          });
      }
    });
  }

  _execute_trading_strategy() {
    let promises = [];
    if (this.config.name === 'trader1') {
      let side;
      for (let i = 0; i < 4; i++) {
        side = i <= 1 ? 'B' : 'S';
        promises.push(this.placeOrder(side));
      }
      Promise.all(promises)
        .then(() => {
          this.subscribeToMessages();
          return setTimeout(() => {
            if (this.config.name === 'trader1')
              this.cancelAllOrders();
          }, 30000);
        });
    }
    else {
      let count = 0;
      timer = setInterval(() => {
        if (this.config.name === 'trader2' && orderbook.quantities.length) {
          count = count + 1;
          return new Promise(async()=>{
            await this.placeOrder('S');
            await this.subscribeToMessages();
            await allConfig.forEach(config => {
              this.logInitialDetails(config);
            });
            if(count === 1){
              clearInterval(timer);
            }
            await this.placeOrder('B');

          }).catch(err => {
            console.log(err);
            clearInterval(timer);
          });
        }
      }, 8000);
    }
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
      resolve(true);
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
          resolve(true);
        }
        else {
          this.updateBalance('ASSETS', currentAssets + calcCoins.coinsToBuy);
          this.updateBalance('CAPITAL', currentCapital - calcCoins.totalCost);
          this.getLastBuyPriceAndQuntity(price, calcCoins.coinsToBuy);
          resolve(this.createOrder(price, side, calcCoins.coinsToBuy));
        }
      }
      else {
        const maxAssetsToUse = currentCapital * (this.config.balance.maxAssetsToUse / 100);
        if (maxAssetsToUse > 0) {
          if(this.config.name === 'trader2') {
            let quntities = orderbook.quantities.map(q => {
              return q;
            });

            if(quntities.length){
              const assetsToSell =  Math.max(...quntities);
              if(assetsToSell < currentCapital) {
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

          } else {
            let assetsToSell = maxAssetsToUse;
            let totalCost = assetsToSell * price;
            this.updateBalance('ASSETS', currentAssets - assetsToSell);
            this.updateBalance('CAPITAL', currentCapital + totalCost);
            resolve(this.createOrder(price, side, assetsToSell));
          }
        }
        else {
          console.log('don\'t have an assets to sell', this.config.name);
          resolve(true);
        }
      }
    });
  }

  getLastBuyPriceAndQuntity(price, quantity) {
    if(this.config.name === 'trader1') {
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