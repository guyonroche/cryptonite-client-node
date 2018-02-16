const systemCleanUp = (trader1, trader2) => {
  return trader1.cancelAllOrders()
    .then(() => trader2.cancelAllOrders())
    .catch(error => {
      console.error(error.stack);
    });
};
module.exports = systemCleanUp;