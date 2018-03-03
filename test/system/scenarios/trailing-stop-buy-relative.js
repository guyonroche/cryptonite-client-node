const run = (trader1, trader2, trader3) => {
  console.log('****************************************************************');
  console.log('** Scenario 6: Trailing Stop Buy Relative                     **');
  console.log('****************************************************************');

  return  trader1.placeLimitOrderSpread(0.25, 0.5, 5, 0.01)
    .then(() => trader2.placeTrailingStopOrder('B', 0.24, 'R', 0.05))

    .then(() => trader3.placeLimitOrder('S', 1, 0.24))
    .then(() => trader1.waitFor(() => trader1.hasMatchingTrade(0.5, 0.24), 'Trader 1 receive a trade of 0.5 LTC at 0.24'))
    .then(() => trader3.waitFor(() => trader3.hasMatchingTrade(0.5, 0.24), 'Trader 3 receive a trade of 0.5 LTC at 0.24'))

    .then(() => trader3.placeLimitOrder('S', 1, 0.23))
    .then(() => trader1.waitFor(() => trader1.hasMatchingTrade(0.5, 0.23), 'Trader 1 receive a trade of 0.5 LTC at 0.23'))
    .then(() => trader3.waitFor(() => trader3.hasMatchingTrade(0.5, 0.23), 'Trader 3 receive a trade of 0.5 LTC at 0.23'))

    .then(() => trader3.placeLimitOrder('S', 1, 0.22))
    .then(() => trader1.waitFor(() => trader1.hasMatchingTrade(0.5, 0.22), 'Trader 1 receive a trade of 0.5 LTC at 0.22'))
    .then(() => trader3.waitFor(() => trader3.hasMatchingTrade(0.5, 0.22), 'Trader 3 receive a trade of 0.5 LTC at 0.22'))

    .then(() => trader3.placeLimitOrder('S', 1, 0.21))
    .then(() => trader1.waitFor(() => trader1.hasMatchingTrade(0.5, 0.21), 'Trader 1 receive a trade of 0.5 LTC at 0.21'))
    .then(() => trader3.waitFor(() => trader3.hasMatchingTrade(0.5, 0.21), 'Trader 3 receive a trade of 0.5 LTC at 0.21'))
    .then(() => trader2.waitFor(() => trader2.hasOpenOrders(1), 'To check trader2 has one open order'))

    .then(() => trader1.placeLimitOrder('B', 1, 0.21))
    .then(() => trader1.waitFor(() => trader1.hasMatchingTrade(0.5, 0.21), 'Trader 1 receive a trade of 0.5 LTC at 0.21'))
    .then(() => trader3.waitFor(() => trader3.hasMatchingTrade(0.5, 0.21), 'Trader 3 receive a trade of 0.5 LTC at 0.21'))
    .then(() => trader2.waitFor(() => trader2.hasOpenOrders(1), 'To check trader2 has one open order'))

    .then(() => trader1.placeLimitOrder('B', 1, 0.22))
    .then(() => trader1.waitFor(() => trader1.hasMatchingTrade(0.5, 0.22), 'Trader 1 receive a trade of 0.5 LTC at 0.22'))
    .then(() => trader3.waitFor(() => trader3.hasMatchingTrade(0.5, 0.22), 'Trader 3 receive a trade of 0.5 LTC at 0.22'))
    .then(() => trader2.waitFor(() => trader2.hasOpenOrders(1), 'To check trader2 has one open order'))

    .then(() => trader1.placeLimitOrder('B', 1, 0.23))
    .then(() => trader1.waitFor(() => trader1.hasMatchingTrade(0.5, 0.23), 'Trader 1 receive a trade of 0.5 LTC at 0.23'))
    .then(() => trader3.waitFor(() => trader3.hasMatchingTrade(0.5, 0.23), 'Trader 3 receive a trade of 0.5 LTC at 0.23'))
    .then(() => trader2.waitFor(() => trader2.hasOpenOrders(0), 'To check trader2 has no open order'))

    .then(() => trader1.waitFor(() => trader1.hasMatchingTrade(0.5, 0.24), 'Trader 1 receive a trade of 1 LTC at 0.24'))
    .then(() => trader2.waitFor(() => trader2.hasMatchingTrade(0.5, 0.24), 'Trader 2 receive a trade of 1 LTC at 0.24'))

    .then(() => trader1.cancelAllOrders())
    .then(() => trader2.cancelAllOrders());
};

module.exports = {
  index: 6,
  run,
};
