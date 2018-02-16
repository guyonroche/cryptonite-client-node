const systemCleanUp = (trader1, trader2) => {
  return new Promise((resolve) => {
    trader1.cancelAllOrders()
      .then(()=> trader2.cancelAllOrders())
      .then(()=> resolve(true))
      .catch(error => {
        console.error(error.stack);
      });
  });
};
module.exports = systemCleanUp;