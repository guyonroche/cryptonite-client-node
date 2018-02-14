const trader = require('./trader');
const config = require('./config.json');
const traders = config.traders;
const async = require('async');

function createTraders(traders) {
  const list = [];
  for (let t of traders) {
    list.push(new trader(t));
  }
  return Promise.resolve(list);
}

function runSequence1(trader1, trader2) {
  async.series(
    {
      init_state1 : function(cb) {
        trader1.init_state(trader1.config).then(() => cb());
      },
      init_state2 : function(cb) {
        trader2.init_state(trader2.config).then(() => cb());
      },
      runScenario1 : function(cb) {
        trader1.runScenario1(trader1.config).then(() => cb());
      },
      placeOrder1 : function(cb) {
        trader2.placeOrder('S').then(() => cb());
      },
      subscribeToMessages1 : function(cb) {
        trader1.subscribeToMessages().then(() => cb());
      },
      subscribeToMessages2 : function(cb) {
        trader2.subscribeToMessages().then(() => cb());
      },
      placeOrder2 : function(cb) {
        trader2.placeOrder('B').then(() => cb());
      },
      init_state3 : function(cb) {
        trader1.init_state(trader1.config).then(() => cb());
      },
      init_state4 : function(cb) {
        trader2.init_state(trader2.config).then(() => cb());
      },
      cancelAllOrders1 : function(cb) {
        trader1.cancelAllOrders().then(() => cb());
      }
    },
    function(err) {
      if(err){
        console.log(err);
      }
    }
  );
}

createTraders(traders)
  .then((traders) => {
    runSequence1(...traders);
  });

