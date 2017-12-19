const { EventEmitter } = require('events');
const Promish = require('promish');
const axios = require('axios');
const WebSocket = require('ws');

const hmacSign = require('./utils/hmac-sign');

module.exports = class CryptoniteClient extends EventEmitter {
  constructor({ protocol = 'https:', hostname, apiKey, apiSecret }) {
    super();
    this.protocol = protocol;
    this.hostname = hostname;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.nonce = 0;
  }

  connect() {
    // first get api token
    const url = `${this.protocol}//${this.hostname}/api/v1/user/api/get-token`;
    const body = {
      timestamp: new Date(),
    };
    const text = body.timestamp.toISOString();
    const signature = hmacSign(this.apiSecret, text);
    const config = {
      headers: {
        'x-api-key': this.apiKey,
        'x-api-signature': signature,
      },
    };
    return axios.post(url, body, config)
      .then(res => {
        if (res.data) {
          if (res.data.success) {
            const wsProtocol = this.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${wsProtocol}//${this.hostname}/api/ws?sid=${res.data.token}`;
            return new Promish((resolve, reject) => {
              this.ws = new WebSocket(wsUrl, {
                perMessageDeflate: false
              });

              this.ws.on('message', m => {
                try {
                  const message = JSON.parse(m);
                  if (message.msg === 'ready') {
                    console.log('ready');
                    resolve();
                  } else {
                    this.emit('message', message);
                  }
                } catch (error) {
                  console.error(error.stack);
                }
              });
              this.ws.on('close', () => this.onDisconnect());

            });
          }
          if (res.data.error) {
            throw new Error(res.data.error);
          }
        }
        throw new Error("Couldn't connect to web socket and I don't know why");
      });
  }
  close() {
    this.ws.close();
  }

  onDisconnect() {
    this.ws = null;
    this.emit('disconnected');
  }
  onMessage(json) {
  }

  brokerOrder(payload) {
    const apiSignature = hmacSign(this.apiSecret, payload);
    const message = {
      msg: 'broker-order',
      apiKey: this.apiKey,
      payload,
      apiSignature,
    };

    console.log(message);

    this.ws.send(JSON.stringify(message), error => {
      if (error) {
        console.error(error.stack);
      } else {
        console.log('message sent');
      }
    });
  }

  createOrder(order) {
    const payload = JSON.stringify({
      action: 'create-order',
      timestamp: new Date(),
      nonce: this.nonce++,
      order,
    });
    this.brokerOrder(payload);
  }

  cancelOrder(orderId) {
    const payload = JSON.stringify({
      action: 'cancel-order',
      timestamp: new Date(),
      nonce: this.nonce++,
      orderId,
    });
    this.brokerOrder(payload);
  }
  cancelOrderByClientId(clientId) {
    const payload = JSON.stringify({
      action: 'cancel-order',
      timestamp: new Date(),
      nonce: this.nonce++,
      clientId,
    });
    this.brokerOrder(payload);
  }
};
