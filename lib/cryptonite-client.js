const https = require('https');
const { EventEmitter } = require('events');
const Promish = require('promish');
const axios = require('axios');
const WebSocket = require('ws');

const hmacSign = require('./utils/hmac-sign');

module.exports = class CryptoniteClient extends EventEmitter {
  constructor({ protocol = 'https:', hostname, apiKey, apiSecret, options }) {
    super();
    this.protocol = protocol;
    this.hostname = hostname;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.options = {
      perMessageDeflate: false,
      ...options
    };
    this.nonce = 0;

    this.axios = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });
  }

  // ==========================================================================
  // Web Socket API
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
    console.log('Request', url, body, config);
    return this.axios.post(url, body, config)
      .then(res => {
        if (res.data) {
          if (res.data.success) {
            const wsProtocol = this.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${wsProtocol}//${this.hostname}/api/ws?sid=${res.data.token}`;
            return new Promish((resolve, reject) => {
              console.log('Connecting', wsUrl, this.options);
              this.ws = new WebSocket(wsUrl, this.options);

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

  // ==========================================================================
  // Rest API

  sendApiRequest(method, url, json) {
    json.timestamp = new Date();
    json.nonce = this.nonce++;

    const payload = JSON.stringify(json);
    const signature = hmacSign(this.apiSecret, payload);
    const config = {
      method,
      url,
      headers: {
        'x-api-key': this.apiKey,
        'x-api-signature': signature,
        'x-api-payload': payload,
      },
    };
    console.log('Request', url, config);
    return this.axios(config)
      .then(result => result.data)
  }

  getBalances() {
    const url = `${this.protocol}//${this.hostname}/api/v1/broker/balances`;
    return this.sendApiRequest('get', url, {});
  }
};
