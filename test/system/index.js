const fs = require('fs');
const Promish = require('promish');
const Trader = require('./trader');
const Commander = require('./commander');
const TestSingleTrader = require('./scenarios/testSingleTrade');
const TestTwoTrader = require('./scenarios/testTwoTrader');
const TestBalances = require('./scenarios/testBalances');
const systemCleanup = require('./systemCleanUp');
const result = require('./systemTestResult');

const ScenarioList = {
  TestSingleTrader,
  TestTwoTrader,
  TestBalances,
};

let arg = [];

function init() {
  Commander.init(arg);
  const config = JSON.parse(fs.readFileSync(arg.config).toString());

  const traders = config.traders;
  createTraders(traders)
    .then(runSequence);
}

function createTraders(traders) {
  const list = [];
  for (let t of traders) {
    list.push(new Trader(t));
  }
  return Promise.resolve(list);
}

function runScenarios(traders) {
  if (arg.scenario) {
    return ScenarioList[arg.scenario](...traders);
  } else {
    let promise = Promish.resolve();
    Object.values(ScenarioList).forEach(scenario => {
      promise = promise
        .then(() => scenario(...traders));
    });
    return promise;
  }
}

function runSequence(traders) {
  Promish.resolve()
    .then(() => systemCleanup(traders))
    .then(() => runScenarios(traders))
    .delay(3000) // to give cancel-order side effects to complete
    .then(() => result(traders))
    .then(() => process.exit())
    .catch(error => {
      console.error(error.stack);
    });
}

init();
