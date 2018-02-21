const trader = require('./trader');
const Commander = require('./commander');
const initTraders = require('./initTraders');
const TestSingleTrader = require('./scenarios/testSingleTrade');
const TestTwoTrader = require('./scenarios/testTwoTrader');
const TestBalances = require('./scenarios/testBalances');
const DevConfig = require('./configs/config.json');
const fs = require('fs');
let config = DevConfig;

const ScenarioList = {
  TestSingleTrader : TestSingleTrader,
  TestTwoTrader : TestTwoTrader,
  TestBalances : TestBalances
};

let arg = [];

function init() {
  Commander.init(arg);
  if(arg.config) {
    config = JSON.parse(fs.readFileSync(arg.config).toString());
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
  if(arg.scenario) {
    initTraders(trader1, trader2)
      .then(() => ScenarioList[arg.scenario](trader1, trader2))
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
