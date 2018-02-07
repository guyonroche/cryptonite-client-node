const CryptoniteClient = require('../lib/cryptonite-client');
const config = require('./config.json');

const client = new CryptoniteClient(config);
const subscriptions = process.argv.slice(2);

client.on('message', message => {
  console.log(JSON.stringify(message));
});

client.connect()
  .then(() => {
    console.log('Listening to web socket...');
    subscriptions.forEach(subscription => {
      const [channel, ...rest] = subscription.split(':');
      const options = {};
      switch (channel) {
        case 'level':
        case 'trade-history':
        case 'trade':
          options.market = rest[0];
          break;
      }

      console.log(`Subscribing to ${channel}`, options);
      client.subscribe(channel, options);
    });
  })
  .catch(error => {
    console.error(error.stack);
  });
