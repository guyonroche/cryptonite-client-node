const run = (trader1, trader2, trader3) => {
  console.log('****************************************************************');
  console.log('** Scenario 9:  Stop Limit Sell Order Filled                     **');
  console.log('****************************************************************');

  return  trader1.placeLimitOrderSpread(0.25, 1, 5, 0.01)
    .then(() => trader2.placeStopLimitOrder(0.22, 'S', 1, 0.235))

    .then(() => trader3.placeMarketOrder('S', 1))

    .then(() => trader1.waitFor(() => trader1.hasMatchingTrade(1, 0.24), 'Trader 1 receive a trade of 1 LTC at 0.24'))
    .then(() => trader3.waitFor(() => trader3.hasMatchingTrade(1, 0.24), 'Trader 3 receive a trade of 1 LTC at 0.24'))
    .then(() => trader2.waitFor(() => trader2.hasOpenOrders(1), 'To check trader2 has one open order'))

    .then(() => trader3.placeMarketOrder('S', 1))

    .then(() => trader1.waitFor(() => trader1.hasMatchingTrade(1, 0.23), 'Trader 1 receive a trade of 1 LTC at 0.23'))
    .then(() => trader3.waitFor(() => trader3.hasMatchingTrade(1, 0.23), 'Trader 3 receive a trade of 1 LTC at 0.23'))

    .then(() => trader1.waitFor(() => trader1.hasMatchingTrade(1, 0.22), 'Trader 1 receive a trade of 1 LTC at 0.22'))
    .then(() => trader2.waitFor(() => trader2.hasMatchingTrade(1, 0.22), 'Trader 2 receive a trade of 1 LTC at 0.22'));
};

module.exports = {
  index: 9,
  run,
};
