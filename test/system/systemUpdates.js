const systemUpdate = (trader1, trader2) => {
  return trader1.subscribeToMessages()
    .then(() => trader2.subscribeToMessages())
    .catch(error => {
      console.error(error.stack);
    });
};
module.exports = systemUpdate;