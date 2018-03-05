const run = (trader1, trader2, trader3) => {
  console.log('****************************************************************');
  console.log('** Scenario 12:  Stop Limit Buy Order Open                     **');
  console.log('****************************************************************');

  return  trader1.placeLimitOrderSpread(0.25, 1, 5, 0.01)
    .then(() => trader2.placeStopLimitOrder(0.27, 'B', 1, 0.265))

    .then(() => trader3.placeMarketOrder('B', 0.26))

    .then(() => trader1.waitFor(() => trader1.hasMatchingTrade(1, 0.26), 'Trader 1 receive a trade of 1 LTC at 0.26'))
    .then(() => trader3.waitFor(() => trader3.hasMatchingTrade(1, 0.26), 'Trader 3 receive a trade of 1 LTC at 0.26'))
    .then(() => trader2.waitFor(() => trader2.hasOpenOrders(1), 'To check trader2 has one open order'))

    .then(() => trader3.placeMarketOrder('B', 0.27))

    .then(() => trader1.waitFor(() => trader1.hasMatchingTrade(1, 0.27), 'Trader 1 receive a trade of 1 LTC at 0.27'))
    .then(() => trader3.waitFor(() => trader3.hasMatchingTrade(1, 0.27), 'Trader 3 receive a trade of 1 LTC at 0.27'))

    .then(() => trader2.waitFor(() => trader2.hasOpenBookedOrders(1), 'To check trader2 has one open order which is booked'));
};

module.exports = {
  index: 12,
  run,
};