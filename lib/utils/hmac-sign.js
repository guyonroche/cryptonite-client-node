const crypto = require('crypto');

module.exports = function hmacSign(secret, text) {
  return crypto.createHmac('sha256', secret)
    .update(text)
    .digest('hex');
};
