const CryptoniteClient = require('../lib/cryptonite-client');
const config = require('./config.json');

const client = new CryptoniteClient(config);

client.on('message', message => {
  console.log(message);
});

client.connect()
  .then(() => {
    console.log('Listening to web socket...');
  })
  .catch(error => {
    console.error(error.stack);
  });
