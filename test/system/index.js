const trader = require('./trader');
const Commander = require('./commander/index');
const initTraders = require('./initTraders');
const TestSingleTrader = require('./testSingleTrade');
const TestTwoTrader = require('./testTwoTrader');
const TestBalances = require('./testBalances');
const DevConfig = require('./configs/config.json');
const ProdConfig = require('./configs/config-prod.json');
let config = DevConfig;

const ScenarioList = {
  TestSingleTrader : TestSingleTrader,
  TestTwoTrader : TestTwoTrader,
  TestBalances : TestBalances
};

let arg = {};

function init() {
  Commander.init(arg);
  if(arg.option === 'config') {
    config = arg.value === 'DevConfig' ? DevConfig : ProdConfig;
  }
  const traders = config.traders;
  createTraders(traders)
    .then((traders) => {
      runSequence(...traders);
    });
}

function createTraders(traders) {
  const list = [];
  for (let t of traders) {
    list.push(new trader(t));
  }
  return Promise.resolve(list);
}

function runSequence(trader1, trader2) {
  
  if(arg.option === 'scenario') {
    initTraders(trader1, trader2)
      .then(() => ScenarioList[arg.value](trader1, trader2))
      .then(() => process.exit())
      .catch(error => {
        console.error(error.stack);
      });
  }
  else {
    initTraders(trader1, trader2)
      .then(() => TestSingleTrader(trader1))
      .then(() => TestTwoTrader(trader1, trader2))
      .then(() => TestBalances(trader1, trader2))
      .catch(error => {
        console.error(error.stack);
      });
  }
}

init();
