const runScenario1 = (trader1) => {
  return new Promise((resolve) => {
    trader1.placeOrder('S')
      .then(() => trader1.placeOrder('B'))
      .then(() => trader1.placeOrder('S'))
      .then(() => trader1.placeOrder('B'))
      .then(() => resolve(true))
      .catch(error => {
        console.error(error.stack);
      });
  });
};
module.exports = runScenario1;
