const trader = require('./trader');
const Commander = require('./commander');
const TestSingleTrader = require('./scenarios/testSingleTrade');
const TestTwoTrader = require('./scenarios/testTwoTrader');
const TestBalances = require('./scenarios/testBalances');
const systemCleanup = require('./systemCleanUp');
const result = require('./systemTestResult');
const initTraders = require('./initTraders');
const fs = require('fs');

const ScenarioList = {
  TestSingleTrader : TestSingleTrader,
  TestTwoTrader : TestTwoTrader,
  TestBalances : TestBalances
};

let arg = [];

function init() {
  Commander.init(arg);
  //const config = JSON.parse(fs.readFileSync(arg.config).toString());
  const config = require('./configs/config.json');

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
    systemCleanup(trader1, trader2)
      .then(() => ScenarioList[arg.scenario](trader1, trader2))
      .then(() => result(trader1, trader2))
      .then(() => process.exit())
      .catch(error => {
        console.error(error.stack);
      });
  }
  else {
    systemCleanup(trader1, trader2)
      .then(() => TestSingleTrader(trader1))
      .then(() => TestTwoTrader(trader1, trader2))
      .then(() => TestBalances(trader1, trader2))
      .then(() => result(trader1, trader2))
      .then(() => process.exit())
      .catch(error => {
        console.error(error.stack);
      });
  }
}

init();
