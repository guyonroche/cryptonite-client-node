const run = (trader1, trader2, trader3) => {
  console.log('****************************************************************');
  console.log('** Scenario 5: Trailing Stop Buy Relative                             **');
  console.log('****************************************************************');

  return  trader1.placeLimitOrderSpread(0.25, 0.5, 5, 0.01)
    .then(() => trader2.placeTrailingStopOrder('B', 0.26, 'R', 0.05))

    .then(() => trader3.placeLimitOrder('B', 1, 0.26))
    .then(() => trader1.waitFor(() => trader1.hasMatchingTrade(0.5, 0.26), 'Trader 1 receive a trade of 0.5 LTC at 0.26'))
    .then(() => trader3.waitFor(() => trader3.hasMatchingTrade(0.5, 0.26), 'Trader 3 receive a trade of 0.5 LTC at 0.26'))

    .then(() => trader3.placeLimitOrder('B', 1, 0.27))
    .then(() => trader1.waitFor(() => trader1.hasMatchingTrade(0.5, 0.27), 'Trader 1 receive a trade of 0.5 LTC at 0.27'))
    .then(() => trader3.waitFor(() => trader3.hasMatchingTrade(0.5, 0.27), 'Trader 3 receive a trade of 0.5 LTC at 0.27'))

    .then(() => trader3.placeLimitOrder('B', 1, 0.28))
    .then(() => trader1.waitFor(() => trader1.hasMatchingTrade(0.5, 0.28), 'Trader 1 receive a trade of 0.5 LTC at 0.28'))
    .then(() => trader3.waitFor(() => trader3.hasMatchingTrade(0.5, 0.28), 'Trader 3 receive a trade of 0.5 LTC at 0.28'))

    .then(() => trader3.placeLimitOrder('B', 1, 0.29))
    .then(() => trader1.waitFor(() => trader1.hasMatchingTrade(0.5, 0.29), 'Trader 1 receive a trade of 0.5 LTC at 0.29'))
    .then(() => trader3.waitFor(() => trader3.hasMatchingTrade(0.5, 0.29), 'Trader 3 receive a trade of 0.5 LTC at 0.29'))
    .then(() => trader2.waitFor(() => trader2.checkOpenOrder(), 'To check trader2 has one open order'))

    .then(() => trader1.placeLimitOrder('S', 1, 0.29))
    .then(() => trader1.waitFor(() => trader1.hasMatchingTrade(0.5, 0.29), 'Trader 1 receive a trade of 0.5 LTC at 0.29'))
    .then(() => trader3.waitFor(() => trader3.hasMatchingTrade(0.5, 0.29), 'Trader 3 receive a trade of 0.5 LTC at 0.29'))
    .then(() => trader2.waitFor(() => trader2.checkOpenOrder(), 'To check trader2 has one open order'))

    .then(() => trader1.placeLimitOrder('S', 1, 0.28))
    .then(() => trader1.waitFor(() => trader1.hasMatchingTrade(0.5, 0.28), 'Trader 1 receive a trade of 0.5 LTC at 0.28'))
    .then(() => trader3.waitFor(() => trader3.hasMatchingTrade(0.5, 0.28), 'Trader 3 receive a trade of 0.5 LTC at 0.28'))
    .then(() => trader2.waitFor(() => trader2.checkOpenOrder(), 'To check trader2 has one open order'))

    .then(() => trader1.placeLimitOrder('S', 1, 0.27))
    .then(() => trader1.waitFor(() => trader1.hasMatchingTrade(0.5, 0.27), 'Trader 1 receive a trade of 0.5 LTC at 0.27'))
    .then(() => trader3.waitFor(() => trader3.hasMatchingTrade(0.5, 0.27), 'Trader 3 receive a trade of 0.5 LTC at 0.27'))
    .then(() => trader2.waitFor(() => trader2.orders.length === 0, 'To check trader2 has no open orders'))

    .then(() => trader1.waitFor(() => trader1.hasMatchingTrade(1, 0.26), 'Trader 1 receive a trade of 1 LTC at 0.26'))
    .then(() => trader2.waitFor(() => trader2.hasMatchingTrade(1, 0.26), 'Trader 2 receive a trade of 1 LTC at 0.26'))

    .then(() => trader1.cancelAllOrders())
    .then(() => trader2.cancelAllOrders());

};
module.exports = {
  index: 5,
  run,
};
