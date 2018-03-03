const fs = require('fs');
const Promish = require('promish');

const Commander = require('./commander');
const Trader = require('./trader');

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

function createTraders(traders) {
  const promises = traders.map(t => {
    const trader = new Trader(t);
    return trader.initialise()
      .then(() => trader);
  });

  return Promish.all(promises)
    .delay(2000);
}

function resetTraders(traders) {
  const promises = traders.map(
    trader => trader.cleanUp()
      .then(() => trader.initState())
  );
  return Promish.all(promises);
}

function runScenarios(traders) {
  if (arg.scenario) {
    return resetTraders(traders)
      .then(() => scenarioList[arg.scenario](...traders));
  } else {
    let promise = Promish.resolve();
    Object.values(scenarioList).forEach(scenario => {
      promise = promise
        .then(() => resetTraders(traders))
        .then(() => scenario(...traders));
    });
    return promise;
  }
}

function runSequence(traders) {
  return Promish.resolve()
    .then(() => runScenarios(traders))
    .then(() => result(traders))
    .then(() => process.exit(0));
}

Commander.init(arg, Object.keys(scenarioList));
const config = JSON.parse(fs.readFileSync(arg.config).toString());

createTraders(config.traders)
  .then(runSequence)
  .catch(error => {
    console.error(error.stack);
    process.exit(1);
  });
