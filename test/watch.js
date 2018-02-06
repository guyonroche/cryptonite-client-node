const CryptoniteClient = require('../lib/cryptonite-client');
const config = require('./config.json');

const client = new CryptoniteClient(config);
const [node, script, ...subscriptions] = process.argv;

client.on('message', message => {
  console.log(message);
});

client.connect()
  .then(() => {
    console.log('Listening to web socket...');
    subscriptions.forEach(subscription => {
      console.log(`Subscribing to ${subscription}`);

    });
  })
  .catch(error => {
    console.error(error.stack);
  });
