const fs = require('fs');
const commander = require('commander');
const CryptoniteClient = require('../../lib/cryptonite-client');
const packageConfig = require('../../package');

commander
  .version(packageConfig.version)
  .arguments('')
  .option('-c, --config <filename>', 'Config file', './config.json')
  .option('-m, --market <market>', 'Market')
  .option('-s, --start <start>', 'Start of query', Date.now() * 1000)
  .option('-l, --limit <limit>', 'Limit of query', 10)
  .option('-v, --verbose', 'Verbose', false);

commander.parse(process.argv);

const config = JSON.parse(fs.readFileSync(commander.config));
const options = {verbose: commander.verbose};
const client = new CryptoniteClient({...config, options});

client.getMyTrades(commander.market, commander.start, commander.limit)
  .then(result => {
    console.log(JSON.stringify(result));
  })
  .catch(error => {
    console.error(error.stack);
  });
