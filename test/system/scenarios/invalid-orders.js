const Promish = require('promish');

const run = (trader1, trader2, trader3) => {
  console.log('****************************************************************');
  console.log('** Scenario 13: Test Invalid Orders                         **');
  console.log('****************************************************************');

  return Promish.resolve()
    .then(() => testMarketOrder(trader1))
    .then(() => testLimitOrder(trader2))
    .then(() => testStopOrder(trader3))
    .then(() => testStopLimitOrder(trader2))
    .then(() => testTrailingStopOrder(trader3));
};

function testMarketOrder(trader1) {
  return Promish.resolve()
    .then(() => trader1.createOrder({ market: 'BTC', type: 'M', side: 'B', quantity: 1}, { expectFail: true , expectFailReason: 'due to invalid market'}))
    .then(() => trader1.createOrder({ type: 'M', side: 'S' }, { expectFail: true, expectFailReason: 'market sell order without qty'}))
    .then(() => trader1.createOrder({ type: 'M', side: 'B', quantity: 1 }, { expectFail: true, expectFailReason: 'market buy order with qty instead value' }))
    .then(() => trader1.createOrder({ type: 'M', quantity: 1 }, { expectFail: true, expectFailReason: 'market order without side'}))
    .then(() => trader1.createOrder({ type: 'M', side: 'S', quantity: 0 }, { expectFail: true, expectFailReason: 'market order with 0 qty' }))
    .then(() => trader1.createOrder({ type: 'M', side: 'S', quantity: -0.5 }, { expectFail: true, expectFailReason: 'market order with negative qty' }))
    .then(() => trader1.createOrder({ type: 'M', side: 'S', quantity: 'd' }, { expectFail: true, expectFailReason: 'market order with qty in string' }))
    .then(() => trader1.createOrder({ type: 'M', side: 1, quantity: 0.5 }, { expectFail: true, expectFailReason: 'market order with side as integer' }))
    .then(() => trader1.createOrder({ type: 'M', side: 'B', value: 0 }, { expectFail: true, expectFailReason: 'market buy order with 0 value' }))
    .then(() => trader1.createOrder({ side: 'S', quantity: 1 }, { expectFail: true, expectFailReason: 'market buy order with 0 value' }));
}

function testLimitOrder(trader2) {
  return Promish.resolve()
    .then(() => trader2.createOrder({ type: 'L', quantity: 1, price: 0.5}, { expectFail: true, expectFailReason: 'limit order without side' }))
    .then(() => trader2.createOrder({ side: 'B', quantity: 1, price: 0.5}, { expectFail: true, expectFailReason: 'limit order without type' }))
    .then(() => trader2.createOrder({ type: 'L', side: 'A', quantity: 1, price: 0.5}, { expectFail: true, expectFailReason: 'limit order with invalid side' }))
    .then(() => trader2.createOrder({ type: 1, side: 'B', quantity: 1, price: 0.5}, { expectFail: true,
      expectFailReason: 'limit order with type as integer' }))
    .then(() => trader2.createOrder({ type: 'L', side: 'S', quantity: 'g', price: 0.5}, { expectFail: true,
      expectFailReason: 'limit order with quantity as string' }))
    .then(() => trader2.createOrder({ type: 'L', side: 'B', price: 0.5}, { expectFail: true, expectFailReason: 'limit order without qty' }))
    .then(() => trader2.createOrder({ type: 'L', side: 'B', quantity: 0, price: 0.5}, { expectFail: true, expectFailReason: 'limit order with 0 qty' }))
    .then(() => trader2.createOrder({ type: 'L', side: 'B', quantity: 0.5, price: 0}, { expectFail: true, expectFailReason: 'limit order with 0 price' }))
    .then(() => trader2.createOrder({ type: 'L', side: 'B', quantity: 0.5}, { expectFail: true, expectFailReason: 'limit order without price' }));

}

function testStopOrder(trader3) {
  return Promish.resolve()
    .then(() => trader3.createOrder({type: 'S', side: 'S', quantity: 0.5}, {expectFail: true, expectFailReason: 'stop order without stop value'}))
    .then(() => trader3.createOrder({ type: 'S', side: 'S', quantity: 0.5, stop: -0.2}, { expectFail: true,
      expectFailReason: 'stop order with negative stop value' }))
    .then(() => trader3.createOrder({type: 'S', side: 'S', quantity: 0.5, stop: 0}, {expectFail: true, expectFailReason: 'stop order with 0 as stop value'}))
    .then(() => trader3.createOrder({type: 'S', side: 'S', quantity: 0.5, stop: 0}, {expectFail: true, expectFailReason: 'stop order with 0 as stop value'}))
    .then(() => trader3.createOrder({type: 'S', side: 'B', quantity: 0.5, stop: 1}, {expectFail: true, expectFailReason: 'stop buy order without value'}));

}
function testStopLimitOrder(trader2) {
  return Promish.resolve()
    .then(() => trader2.createOrder({ type: 'SL', side: 'B', quantity: 0.5, price:0.25, stop: 0}, { expectFail: true,
      expectFailReason: 'stop limit order with 0 stop value' }))
    .then(() => trader2.createOrder({ type: 'SL', side: 'B', quantity: 0.5, price:0.25, stop: -0.5}, { expectFail: true,
      expectFailReason: 'stop limit with negative stop value' }))
    .then(() => trader2.createOrder({ type: 'SL', side: 'S', quantity: 0.5, price:0.25, stop: 'b'}, { expectFail: true,
      expectFailReason: 'stop limit with string stop value' }))
    .then(() => trader2.createOrder({ type: 'SL', side: 'S', quantity: 0.5, price:0.25 }, { expectFail: true,
      expectFailReason: 'stop limit order without stop value' }));
}

function testTrailingStopOrder(trader3) {
  return Promish.resolve()
    .then(() => trader3.createOrder({ type: 'ST', side: 'S', quantity: 0.5, trailType: 'K' ,trail: 0.5}, { expectFail: true,
      expectFailReason: 'trail stop order with invalid trail type' }))
    .then(() => trader3.createOrder({ type: 'ST', side: 'S', quantity: 0.5, trailType: 'R' ,trail: 0}, { expectFail: true,
      expectFailReason: 'trail stop order with 0 trail value' }))
    .then(() => trader3.createOrder({ type: 'ST', side: 'S', quantity: -0.5, trailType: 'R' ,trail: 0.25}, { expectFail: true,
      expectFailReason: 'trail stop order with negative qty' }))
    .then(() => trader3.createOrder({ type: 'ST', side: '1', quantity: 0.5, trailType: 'O'}, { expectFail: true,
      expectFailReason: 'trail stop order with invalid side' }));

}

module.exports = {
  index: 13,
  run,
};
