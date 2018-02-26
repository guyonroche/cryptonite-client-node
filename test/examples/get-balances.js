const fs = require('fs');
const commander = require('commander');
const CryptoniteClient = require('../../lib/cryptonite-client');
const packageConfig = require('../../package');

commander
  .version(packageConfig.version)
  .arguments('')
  .option('-c, --config <filename>', 'Config file', './config.json');

commander.parse(process.argv);

const config = JSON.parse(fs.readFileSync(commander.config));
const client = new CryptoniteClient(config);

client.getBalances()
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error(error.stack);
  });
