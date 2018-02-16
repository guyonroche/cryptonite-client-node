const systemUpdate = (trader1, trader2) => {
  return new Promise((resolve) => {
    trader1.subscribeToMessages()
      .then(()=> trader2.subscribeToMessages())
      .then(()=>resolve(true))
      .catch(error => {
        console.error(error.stack);
      });
  });
};
module.exports = systemUpdate;