const initTraders = (trader1, trader2) => {
  return trader1.init_state(trader1.config)
    .then(() => trader2.init_state(trader2.config))
    .catch(error => {
      console.error(error.stack);
    });
};
module.exports = initTraders;