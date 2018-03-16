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
    .then(() => testTrailingStopOrder(trader3))
    .then(() => testInvalidOrderType(trader3));

};

function testMarketOrder(trader1) {
  return Promish.resolve()
  // test of market property
    .then(() => trader1.createOrder({ market: 'BTC', type: 'M', side: 'B', quantity: 1}, { expectFail: true , expectFailReason: 'due to invalid market'}))
    .then(() => trader1.createOrder({ market: '1', type: 'M', side: 'B', quantity: 1}, { expectFail: true ,
      expectFailReason: 'market value as integer without market'}))

  // test of side property
    .then(() => trader1.createOrder({ type: 'M', side: 1, quantity: 0.5 }, { expectFail: true, expectFailReason: 'market order with side as integer' }))
    .then(() => trader1.createOrder({ type: 'M', side: 'M', quantity: 0.5 }, { expectFail: true, expectFailReason: 'market order invalid side' }))
    .then(() => trader1.createOrder({ type: 'M', quantity: 1 }, { expectFail: true, expectFailReason: 'market order without side'}))

  // test for qty property
    .then(() => trader1.createOrder({ type: 'M', side: 'S' }, { expectFail: true, expectFailReason: 'market sell order without qty'}))
    .then(() => trader1.createOrder({ type: 'M', side: 'S', quantity: 0 }, { expectFail: true, expectFailReason: 'market order with 0 qty' }))
    .then(() => trader1.createOrder({ type: 'M', side: 'S', quantity: -0.5 }, { expectFail: true, expectFailReason: 'market order with negative qty' }))
    .then(() => trader1.createOrder({ type: 'M', side: 'S', quantity: 'd' }, { expectFail: true, expectFailReason: 'market order with qty in string' }))

    // test for value property
    .then(() => trader1.createOrder({ type: 'M', side: 'B', quantity: 1 }, { expectFail: true, expectFailReason: 'market buy order with qty instead value' }))
    .then(() => trader1.createOrder({ type: 'M', side: 'B', value: 0 }, { expectFail: true, expectFailReason: 'market buy order value as 0' }))
    .then(() => trader1.createOrder({ type: 'M', side: 'B', value: -1 }, { expectFail: true, expectFailReason: 'market buy order with negative value' }))
    .then(() => trader1.createOrder({ type: 'M', side: 'B' }, { expectFail: true, expectFailReason: 'market buy order without value' }))
    .then(() => trader1.createOrder({ type: 'M', side: 'S', value: 1 }, { expectFail: true, expectFailReason: 'market sell order with value instead qty' }));
}

function testLimitOrder(trader2) {
  return Promish.resolve()


  // test for market property

    .then(() => trader2.createOrder({ market: 'BTC', type: 'L', quantity: 1, price: 0.5}, { expectFail: true,
      expectFailReason: 'limit order with invalid market' }))

    .then(() => trader2.createOrder({ market: '1', type: 'L', side: 'A', quantity: 1, price: 0.5}, { expectFail: true,
      expectFailReason: 'limit order market value as integer' }))

    // test for side property

    .then(() => trader2.createOrder({ type: 'L', quantity: 1, price: 0.5}, { expectFail: true, expectFailReason: 'limit order without side' }))
    .then(() => trader2.createOrder({ type: 'L', side: 'A', quantity: 1, price: 0.5}, { expectFail: true, expectFailReason: 'limit order with invalid side' }))

    .then(() => trader2.createOrder({ type: 'L', side: '1', quantity: 1, price: 0.5}, { expectFail: true,
      expectFailReason: 'limit order with side as integer' }))

    //  test for qty
    .then(() => trader2.createOrder({ type: 'L', side: 'B', price: 0.5}, { expectFail: true, expectFailReason: 'limit order without qty' }))
    .then(() => trader2.createOrder({ type: 'L', side: 'B', quantity: 0, price: 0.5}, { expectFail: true, expectFailReason: 'limit order with 0 qty' }))

    .then(() => trader2.createOrder({ type: 'L', side: 'B', quantity: 'Q', price: 0.5}, { expectFail: true,
      expectFailReason: 'limit order with qty as string' }))

    .then(() => trader2.createOrder({ type: 'L', side: 'B', quantity: -0.25, price: 0.5}, { expectFail: true,
      expectFailReason: 'limit order with negative qty' }))

  // test for price
    .then(() => trader2.createOrder({ type: 'L', side: 'B', quantity: 1}, { expectFail: true, expectFailReason: 'limit order without price' }))
    .then(() => trader2.createOrder({ type: 'L', side: 'B', quantity: 1, price: 0}, { expectFail: true, expectFailReason: 'limit order with 0 price' }))

    .then(() => trader2.createOrder({ type: 'L', side: 'B', quantity: 1, price: 'P'}, { expectFail: true,
      expectFailReason: 'limit order with price as string' }))

    .then(() => trader2.createOrder({ type: 'L', side: 'B', quantity: 1, price: -0.5}, { expectFail: true,
      expectFailReason: 'limit order with negative price' }));


}

function testStopOrder(trader3) {
  return Promish.resolve()

    // test for market
    .then(() => trader3.createOrder({ market: 'BTC', type: 'S', side: 'S', quantity: 0.5}, {expectFail: true,
      expectFailReason: 'stop order with invalid market'}))

    .then(() => trader3.createOrder({ market: '1', type: 'S', side: 'S', quantity: 0.5}, {expectFail: true,
      expectFailReason: 'stop order with market as integer'}))

    // test for side

    .then(() => trader3.createOrder({type: 'S', side: 'A', quantity: 0.5}, {expectFail: true,
      expectFailReason: 'stop order with invalid side'}))

    .then(() => trader3.createOrder({type: 'S', side: '1', quantity: 0.5}, {expectFail: true,
      expectFailReason: 'stop order with side as integer'}))

    .then(() => trader3.createOrder({type: 'S', quantity: 0.5}, {expectFail: true,
      expectFailReason: 'stop order without side'}))


    // test for stop value

    .then(() => trader3.createOrder({type: 'S', side: 'S', quantity: 0.5}, {expectFail: true,
      expectFailReason: 'stop order without stop value'}))

    .then(() => trader3.createOrder({ type: 'S', side: 'S', quantity: 0.5, stop: -0.2}, { expectFail: true,
      expectFailReason: 'stop order with negative stop value' }))

    .then(() => trader3.createOrder({type: 'S', side: 'S', quantity: 0.5, stop: 0}, {expectFail: true,
      expectFailReason: 'stop order with 0 as stop value'}))

    .then(() => trader3.createOrder({type: 'S', side: 'S', quantity: 0.5, stop: 'S'}, {expectFail: true,
      expectFailReason: 'stop order with stop value as string'}))

    // test for value

    .then(() => trader3.createOrder({type: 'S', side: 'B', stop: 1}, { expectFail: true,
      expectFailReason: 'stop buy order without value'}))

    .then(() => trader3.createOrder({type: 'S', side: 'B', value: -0.5, stop: 1}, { expectFail: true,
      expectFailReason: 'stop buy order with negative value'}))

    .then(() => trader3.createOrder({type: 'S', side: 'B', value: 0, stop: 1}, { expectFail: true,
      expectFailReason: 'stop buy order with value as 0'}))

    .then(() => trader3.createOrder({type: 'S', side: 'B', value: 'V', stop: 1}, { expectFail: true,
      expectFailReason: 'stop buy order with value as string'}));

}
function testStopLimitOrder(trader2) {
  return Promish.resolve()


    // test for market property

    .then(() => trader2.createOrder({ market: 'BTC', type: 'SL', side: 'B', quantity: 0.5, price:0.25, stop: 0}, { expectFail: true,
      expectFailReason: 'stop limit order with 0 stop value' }))

    .then(() => trader2.createOrder({ market: '1', type: 'SL', side: 'B', quantity: 0.5, price:0.25, stop: 0}, { expectFail: true,
      expectFailReason: 'stop limit order market as string' }))

    // test for side

    .then(() => trader2.createOrder({ type: 'SL', quantity: 0.5, price:0.25, stop: 0}, { expectFail: true,
      expectFailReason: 'stop limit order without  side' }))

    .then(() => trader2.createOrder({ type: 'SL', side: 'A', quantity: 0.5, price:0.25, stop: 0}, { expectFail: true,
      expectFailReason: 'stop limit order with invalid side' }))

    .then(() => trader2.createOrder({ type: 'SL', side: '1', quantity: 0.5, price:0.25, stop: 0}, { expectFail: true,
      expectFailReason: 'stop limit order with side as integer' }))

    // test for qty

    .then(() => trader2.createOrder({ type: 'SL', side: '1', quantity: 0, price:0.25, stop: 0}, { expectFail: true,
      expectFailReason: 'stop limit order with qty 0' }))

    .then(() => trader2.createOrder({ type: 'SL', side: '1', quantity: -0.5, price:0.25, stop: 0}, { expectFail: true,
      expectFailReason: 'stop limit order with negative qty' }))

    .then(() => trader2.createOrder({ type: 'SL', side: '1', quantity: 'Q', price:0.25, stop: 0}, { expectFail: true,
      expectFailReason: 'stop limit order with qty as string' }))

    .then(() => trader2.createOrder({ type: 'SL', side: '1', price:0.25, stop: 0}, { expectFail: true,
      expectFailReason: 'stop limit order without qty' }))

    // test for price
    .then(() => trader2.createOrder({ type: 'SL', side: '1', price: 0, stop: 0}, { expectFail: true,
      expectFailReason: 'stop limit order with price 0' }))

    .then(() => trader2.createOrder({ type: 'SL', side: '1', price: -0.25, stop: 0}, { expectFail: true,
      expectFailReason: 'stop limit order with negative price' }))

    .then(() => trader2.createOrder({ type: 'SL', side: '1', price: 'P', stop: 0}, { expectFail: true,
      expectFailReason: 'stop limit order with price as string' }))

    .then(() => trader2.createOrder({ type: 'SL', side: '1', stop: 0}, { expectFail: true,
      expectFailReason: 'stop limit order without price' }))


    // test for stop value

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

    // test for market

    .then(() => trader3.createOrder({ market: 'BTC', type: 'ST', side: 'S', quantity: 0.5, trailType: 'R' ,trail: 0.5}, { expectFail: true,
      expectFailReason: 'trail stop order with invalid market' }))

    .then(() => trader3.createOrder({ market: '1', type: 'ST', side: 'S', quantity: 0.5, trailType: 'O' ,trail: 0.5}, { expectFail: true,
      expectFailReason: 'trail stop order with market as integer' }))


    // test for side

    .then(() => trader3.createOrder({ type: 'ST', side: 'A', quantity: 0.5, trailType: 'R' ,trail: 0.5}, { expectFail: true,
      expectFailReason: 'trail stop order with invalid side' }))

    .then(() => trader3.createOrder({ type: 'ST', quantity: 0.5, trailType: 'K' ,trail: 0.5}, { expectFail: true,
      expectFailReason: 'trail stop order without side' }))

    .then(() => trader3.createOrder({ type: 'ST', side: '2', quantity: 0.5, trailType: 'R' ,trail: 0.5}, { expectFail: true,
      expectFailReason: 'trail stop order with invalid side' }))


    // test for qty

    .then(() => trader3.createOrder({ type: 'ST', side: 'S', quantity: -0.5, trailType: 'R' ,trail: 0.5}, { expectFail: true,
      expectFailReason: 'trail stop order with negative qty' }))

    .then(() => trader3.createOrder({ type: 'ST', side: 'S', quantity: 0, trailType: 'R' ,trail: 0.5}, { expectFail: true,
      expectFailReason: 'trail stop order with qty 0' }))

    .then(() => trader3.createOrder({ type: 'ST', side: 'S', quantity: 'Q', trailType: 'R' ,trail: 0.5}, { expectFail: true,
      expectFailReason: 'trail stop order with qty as string' }))

    .then(() => trader3.createOrder({ type: 'ST', side: 'S', trailType: 'R' ,trail: 0.5}, { expectFail: true,
      expectFailReason: 'trail stop order without qty' }))

  // test for trail type

    .then(() => trader3.createOrder({ type: 'ST', side: 'S', quantity: 0.5, trailType: 'T' ,trail: 0.5}, { expectFail: true,
      expectFailReason: 'trail stop order with invalid trail type' }))

    .then(() => trader3.createOrder({ type: 'ST', side: 'S', quantity: 0.5, trailType: 1 ,trail: 0.5}, { expectFail: true,
      expectFailReason: 'trail stop order with trail type as integer' }))

    .then(() => trader3.createOrder({ type: 'ST', side: 'S', quantity: 0.5 ,trail: 0.5}, { expectFail: true,
      expectFailReason: 'trail stop order without trail type' }))

  // test for trail value

    .then(() => trader3.createOrder({ type: 'ST', side: 'S', quantity: 1, trailType: 'R' ,trail: 0}, { expectFail: true,
      expectFailReason: 'trail stop order with trail 0' }))

    .then(() => trader3.createOrder({ type: 'ST', side: 'S', quantity: 1, trailType: 'R' ,trail: -0.5}, { expectFail: true,
      expectFailReason: 'trail stop order with negative trail' }))

    .then(() => trader3.createOrder({ type: 'ST', side: 'S', quantity: 1, trailType: 'R'}, { expectFail: true,
      expectFailReason: 'trail stop order without trail' }))

    .then(() => trader3.createOrder({ type: 'ST', side: 'S', quantity: 1, trailType: 'R',trail: 'TR'}, { expectFail: true,
      expectFailReason: 'trail stop order with trail as string' }))



    .then(() => trader3.createOrder({ type: 'ST', side: 'B', value: 0, trailType: 'R',trail: 0.5}, { expectFail: true,
      expectFailReason: 'trail stop buy order with value as 0' }))

    .then(() => trader3.createOrder({ type: 'ST', side: 'B', value: -0.5, trailType: 'R',trail: 0.5}, { expectFail: true,
      expectFailReason: 'trail stop buy order with negative value' }))

    .then(() => trader3.createOrder({ type: 'ST', side: 'B', trailType: 'R', trail: 0.5}, { expectFail: true,
      expectFailReason: 'trail stop buy order without value' }));
}

function testInvalidOrderType(trader1) {
  // test for type
  return Promish.resolve()
    .then(() => trader1.createOrder({ side: 'B', quantity: 1, price: 0.5}, { expectFail: true,
      expectFailReason: 'order without type' }))

    .then(() => trader1.createOrder({ type: 1, side: 'B', quantity: 1, price: 0.5}, { expectFail: true,
      expectFailReason: 'order with type as integer' }))

    .then(() => trader1.createOrder({ type: 'Foo', side: 'B', quantity: 1, price: 0.5}, { expectFail: true,
      expectFailReason: 'order with invalid type as Foo' }));

}

module.exports = {
  index: 13,
  run,
};
