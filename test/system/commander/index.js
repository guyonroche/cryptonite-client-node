const program = require('commander');

let allowedConfig = ['ProdConfig', 'DevConfig'];
let allowedScenarios = ['TestSingleTrader', 'TestTwoTrader', 'TestBalances'];

const Commander = (arg) => {
  program
    .command('scenario <scenarioName>')
    .alias('s')
    .description('Choose Scenario To execute')
    .action((name) => {
      if (allowedScenarios.includes(name)) {
        console.log('selected scenario is', name);
        arg.value = name;
        arg.option = 'scenario';
      } else {
        console.log('Scenario ', name, ' is not allowed. Allowed values are :', allowedScenarios.toString());
        process.exit(1);
      }
    });

  program
    .command('config <config>')
    .alias('c')
    .description('Choose config')
    .action((config) => {
      if (allowedConfig.includes(config)) {
        console.log('selected config is', config);
        arg.value = config;
        arg.option = 'Config';
      } else {
        console.log('Config ', config, ' is not allowed.  Allowed values are :', allowedConfig.toString());
        process.exit(1);
      }
    });

  program.parse(process.argv);

};

module.exports = {
  init: Commander
};