const Promish = require('promish');
const moment = require('moment');

const run = (trader1) => {
  console.log('****************************************************************');
  console.log('** Scenario 14: Throttled Requests                              **');
  console.log('****************************************************************');

  const endTime = moment().add(1, 'seconds');

  const promises = [];

  while (moment() <= endTime) {
    promises.push(trader1.client.getBalances());
  }

  return Promish.all(promises)
    .then((res) => {
      console.log(res.length);
      // check response of every request and then
      // check response code here and throw error
    });
};


module.exports = {
  index: 14,
  pending: true,
  run,
};
