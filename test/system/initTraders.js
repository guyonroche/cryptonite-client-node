const initTraders = (trader1, trader2) => {
  return new Promise((resolve) => {
    trader1.init_state(trader1.config)
      .then(()=> trader2.init_state(trader2.config))
      .then(()=>resolve(true))
      .catch(error => {
        console.error(error.stack);
      });
  });
};
module.exports = initTraders;