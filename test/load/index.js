const fs = require('fs');
const program = require('commander');
const packageConfig = require('../../package');

program
  .version(packageConfig.version)
  .option('-t, --time <milliseconds>', 'Time to run', Infinity)
  .option('-s, --strategy <filename>', 'Strategy file', './spread-and-cancel-strategy.json')
  .option('-c, --config <filename>', 'Config file', './configs/config.json');

program.parse(process.argv);

const strategyConfig = JSON.parse(fs.readFileSync(program.strategy).toString());
const config = JSON.parse(fs.readFileSync(program.config).toString());

const Strategy = require(`./strategies/${strategyConfig.name}`);
const strategy = new Strategy(strategyConfig, config);

strategy.initialise()
  .then(() => strategy.start())
  .then(() => {
    setTimeout(() => {
      strategy.stop()
        .then(() => strategy.report())
        .then(() => process.exit(0));
    }, program.time);
  })
  .catch(error => {
    console.error(error.stack);
    process.exit(1);
  });