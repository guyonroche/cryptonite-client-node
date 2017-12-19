const CryptoniteClient = require('../lib/cryptonite-client');
const config = require('./config.json');


const idType = process.argv[2];
const id = process.argv[3];

const client = new CryptoniteClient(config);

client.on('message', message => {
  if (message.msg !== 'open-markets') {
    console.log(message);
  }
});

client.connect()
  .then(() => {
    switch (idType) {
      case 'client':
        client.cancelOrderByClientId(id);
        break;
      case 'order':
        client.cancelOrder(id);
        break;
    }
  })
  .catch(error => {
    console.error(error.stack);
  });
