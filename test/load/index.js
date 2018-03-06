const fs = require('fs');
const program = require('commander');
const packageConfig = require('../../package');

program
  .version(packageConfig.version)
  .option('-t, --time <seconds>', 'Time to run', parseInt, Infinity)
  .option('-s, --strategy <filename>', 'Strategy file', './spread-and-cancel-strategy.json')
  .option('-c, --config <filename>', 'Config file', './configs/config.json');

program.parse(process.argv);

const strategyConfig = JSON.parse(fs.readFileSync(program.strategy).toString());
const config = JSON.parse(fs.readFileSync(program.config).toString());

const Strategy = require(`./strategies/${strategyConfig.name}`);
const strategy = new Strategy(strategyConfig, config);

let progressTimer;
function showProgress(timeout) {
  const progress = [];
  for (let i = 0; i < 50; i++) {
    progress.push('-');
  }

  process.stdout.write(`[${progress.join('')}]\r`);
  let count = 0;
  progressTimer = setInterval(() => {
    if (count < progress.length) {
      progress[count++] = '+';
      process.stdout.write(`[${progress.join('')}]\r`);
    }
  }, Math.floor(timeout / 50));
}

strategy.initialise()
  .then(() => strategy.start())
  .then(() => {
    const timeout = program.time * 1000;
    setTimeout(() => {
      strategy.stop()
        .then(() => {
          if (progressTimer) {
            clearInterval(progressTimer);
            console.log('');
          }
          strategy.report();
        })
        .then(() => process.exit(0));
    }, timeout);

    if (timeout !== Infinity) {
      showProgress(timeout);
    } else {
      console.log('Running...')
    }
  })
  .catch(error => {
    console.error(error.stack);
    process.exit(1);
  });