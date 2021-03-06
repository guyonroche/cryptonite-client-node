const fs = require('fs');
const commander = require('commander');
const CryptoniteClient = require('../../lib/cryptonite-client');

const packageConfig = require('../../package');

function list(val) {
  return val.split(',');
}
commander
  .version(packageConfig.version)
  .arguments('')
  .option('-c, --config <filename>', 'Config file', './config.json')
  .option('-s, --subscribe <subscriptions>', 'Subscriptions', list, []);

commander.parse(process.argv);

const config = JSON.parse(fs.readFileSync(commander.config));
const client = new CryptoniteClient(config);

client.on('message', message => {
  console.log(JSON.stringify(message));
});

client.connect()
  .catch(error => {
    console.error(error.stack);
  });

client.on('ready', () => {
  console.log('Listening to web socket...');
  commander.subscribe.forEach(subscription => {
    const [channel, ...rest] = subscription.split(':');
    const options = {};
    switch (channel) {
      case 'level':
      case 'trade':
        options.market = rest[0];
        break;
      case 'trade-history':
        options.market = rest[0];
        options.size = rest[1];
        break;
    }

    console.log(`Subscribing to ${channel}`, options);
    client.subscribe(channel, options);
  });
});