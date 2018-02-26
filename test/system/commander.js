const program = require('commander');
const fs = require('fs');
let allowedScenarios = ['TestSingleTrader', 'TestTwoTrader', 'TestBalances', 'testMarketStopOrder'];

const Commander = (arg) => {
  program
    .version('0.1.0')
    .option('-s, --scenario <scenarioName>', 'choose scenario')
    .option('-c, --config <config>', 'choose config file', './configs/config.json')
    .parse(process.argv);

  if(program.scenario){
    if (allowedScenarios.includes(program.scenario)) {
      console.log('selected scenario is', program.scenario);
      arg.scenario = program.scenario;
    } else {
      console.log('Scenario ', program.scenario, ' is not allowed. Allowed values are :', allowedScenarios.join());
      process.exit(1);
    }
  }

  if(program.config) {
    if (fs.existsSync(program.config)) {
      console.log('selected config is', program.config);
      arg.config = program.config;
    } else {
      console.log(program.config ,'file does not exits');
      process.exit(1);
    }
  }
};

module.exports = {
  init: Commander
};