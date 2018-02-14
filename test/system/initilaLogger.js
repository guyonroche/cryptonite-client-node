const columnify = require('columnify');
let showColumnHeaders = true;
const initialDetails = ({config}) => {

  const currentTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  console.log('********** Balance info ************');
  const columnWidths = {
    Bot: {minWidth: 20, maxWidth: 20},
    startTime: {minWidth: 15, maxWidth: 15},
    TradingPair: {minWidth: 11, maxWidth: 11},
    CurrentAssets: {minWidth: 20, maxWidth: 20},
    CurrentCapital: {minWidth: 20, maxWidth: 20},
  };

  let detailsRow = columnify([{
    Trader: config.name,
    startTime: currentTime,
    TradingPair: config.coinSymbol + ' / ' + config.capitalSymbol,
    AvailableBTC: config.balance.assets + ' ' + config.coinSymbol,
    AvailableLTC: config.balance.capital + ' ' + config.capitalSymbol
  }], {
    align: 'right',
    columnSplitter: ' | ',
    config: columnWidths,
    showHeaders: showColumnHeaders
  }
  );
  if (showColumnHeaders) {
    showColumnHeaders = false;
  }

  return console.log(detailsRow);
};

module.exports = initialDetails;