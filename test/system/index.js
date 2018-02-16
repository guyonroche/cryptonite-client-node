const trader = require('./trader');
const config = require('./config.json');
const traders = config.traders;
const initTraders = require('./initTraders');
const scenario1 = require('./runScenario1');
const scenario2 = require('./runScenario2');

function createTraders(traders) {
  const list = [];
  for (let t of traders) {
    list.push(new trader(t));
  }
  return Promise.resolve(list);
}

createTraders(traders)
  .then((traders) => {
    runSequence(...traders);
  });

function runSequence(trader1, trader2) {
  initTraders(trader1, trader2)
    .then(()=> scenario1(trader1))
    .then(()=>scenario2(trader1, trader2))
    .catch(error => {
      console.error(error.stack);
    });
}