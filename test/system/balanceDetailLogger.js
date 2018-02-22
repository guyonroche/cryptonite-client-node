const columnify = require('columnify');
let showColumnHeaders = true;
const balanceDetailsLogger = ({config}) => {
  let text = `********************** Test result for ${config.name} **************************\n`;
  const row = columnify([{
    info: 'Assets:',
    available: Number(config.balance.available.assets).toFixed(2) + ` ${config.coinSymbol}`,
    current: Number(config.balance.current.assets).toFixed(2) + ` ${config.coinSymbol}`,
  }, {
    info: 'Capital:',
    available: Number(config.balance.available.capital).toFixed(2) + ` ${config.capitalSymbol}`,
    current: Number(config.balance.current.capital).toFixed(2) + ` ${config.capitalSymbol}`,
  }]);

  if (showColumnHeaders) {
    showColumnHeaders = false;
  }

  text += `${row}\n`;

  // gather all text together then output atomically.
  console.log(text);
};

module.exports = balanceDetailsLogger;
