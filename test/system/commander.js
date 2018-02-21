const program = require('commander');
const fs = require('fs');
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
        console.log('Scenario ', name, ' is not allowed. Allowed values are :', allowedScenarios.join());
        process.exit(1);
      }
    });

  program
    .command('config <config>')
    .alias('c')
    .description('Choose config')
    .action((config) => {
      if (fs.existsSync(config)) {
        console.log('selected config is', config);
        arg.value = config;
        arg.option = 'config';
      } else {
        console.log(config ,'file does not exits');
        process.exit(1);
      }
    });

  program.parse(process.argv);

};

module.exports = {
  init: Commander
};