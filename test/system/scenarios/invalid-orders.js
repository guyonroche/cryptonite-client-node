const Promish = require('promish');

const run = (trader1, trader2, trader3) => {
  console.log('****************************************************************');
  console.log('** Scenario 13: Test Invalid Orders                         **');
  console.log('****************************************************************');

  return Promish.resolve()
    .then(() => trader2.placeLimitOrder('B', -1, 0.11, { expectFail: true })) // negative qty
    .then(() => trader3.placeLimitOrder('S', 1, -0.15, { expectFail: true })) // negative price
    .then(() => trader1.placeLimitOrder('A', 1, 0.10, { expectFail: true })) // invalid side
    .then(() => trader2.placeLimitOrder('', 1, 0.10, { expectFail: true })) // without side
    .then(() => trader3.placeLimitOrder('B', '', '', { expectFail: true })) // without qty && price

    .then(() => trader3.placeMarketOrder('B', '1', 'BTC', { expectFail: true })) // invalid market

    .then(() => trader1.placeStopOrder('B', '1', '', { expectFail: true })) // without stop value
    .then(() => trader2.placeStopOrder('B', '1', -0.5, { expectFail: true })) // negative stop value

    .then(() => trader3.placeTrailingStopOrder('B', 1, '', 0.05, { expectFail: true })) // without trail type
    .then(() => trader1.placeTrailingStopOrder('B', 1, 'H', '', { expectFail: true })) // without trail value
    .then(() => trader2.placeTrailingStopOrder('B', 1, 'K', '', { expectFail: true })) // invalid trail type
    .then(() => trader3.placeTrailingStopOrder('B', 1, 'H', -0.5, { expectFail: true })); // negative trail value

};

module.exports = {
  index: 13,
  run,
};
