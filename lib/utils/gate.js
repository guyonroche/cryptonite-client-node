const Promish = require('promish');

module.exports = class Gate {
  constructor(name, maxConcurrent) {
    this.name = name;
    this.claimCount = 0;
    this.maxConcurrent = maxConcurrent;
    this.queue = [];
  }

  get queueLength() {
    return this.queue.length;
  }

  claim() {
    return new Promish(resolve => {
      if (this.claimCount < this.maxConcurrent) {
        this.claimCount++;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }

  claimAll() {
    const promises = [];
    for (let i = 0; i < this.maxConcurrent; i++) {
      promises.push(this.claim());
    }
    return Promish.all(promises);
  }

  release() {
    if (this.queue.length) {
      const resolve = this.queue.shift();
      resolve();
    } else {
      this.claimCount--;
    }
  }
};
