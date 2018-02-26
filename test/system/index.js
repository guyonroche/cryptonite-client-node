const fs = require('fs');
const Promish = require('promish');
const Trader = require('./trader');
const Commander = require('./commander');
const systemCleanup = require('./systemCleanUp');
const result = require('./systemTestResult');

// Read the scenarios/ directory, sort the files by index and assign to scenarioList
const scenarioList = fs.readdirSync(`${__dirname}/scenarios/`)
  .filter(filename => /\.js$/.test(filename))
  .map(filename => ({
    scenario: require(`${__dirname}/scenarios/${filename}`),
    name: filename.substr(0, filename.length - 3),
  }))
  .sort((a,b) => a.scenario.index - b.scenario.index)
  .reduce((o, t) => {
    o[t.name] = t.scenario.run;
    return o;
  }, {});

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
    return scenarioList[arg.scenario](...traders);
  } else {
    let promise = Promish.resolve();
    Object.values(scenarioList).forEach(scenario => {
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
    .delay(1000) // to give cancel-order side effects to complete
    .then(() => result(traders))
    .then(() => process.exit())
    .catch(error => {
      console.error(error.stack);
    });
}

init();
