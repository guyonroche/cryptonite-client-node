const fs = require('fs');
const commander = require('commander');
const CryptoniteClient = require('../../lib/cryptonite-client');
const packageConfig = require('../../package');

commander
  .version(packageConfig.version)
  .arguments('')
  .option('-c, --config <filename>', 'Config file', './config.json')
  .option('-m, --market <market>', 'Market')
  .option('-t, --state <state>', 'Order State', 'open')
  .option('-s, --start <start>', 'Start of query', 0)
  .option('-l, --limit <limit>', 'Limit of query', 10);

commander.parse(process.argv);

const config = JSON.parse(fs.readFileSync(commander.config));
const client = new CryptoniteClient(config);

client.getMyOrders(commander.market, commander.state, commander.start, commander.limit)
  .then(result => {
    console.log(JSON.stringify(result));
  })
  .catch(error => {
    console.error(error.stack);
  });
