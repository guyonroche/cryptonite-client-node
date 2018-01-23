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

  sendApiRequest(method, url, headers, json) {
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
          ...headers
      },
    };
    console.log('Request', url, config);
    return this.axios(config)
      .then(result => result.data)
        .catch(err => console.log(err))
  }

  getBalances() {
    const url = `${this.protocol}//${this.hostname}/api/v1/broker/balances`;
      const headers = {
          'x-sid': 'sessionid', //login session id,
      };
    return this.sendApiRequest('get', url, headers, {});
  }

  getMyOrders() {
      const url = `${this.protocol}//${this.hostname}/api/v1/broker/my-orders `;
      const headers = {
            'x-sid': 'sessionid',
            'x-paging-start': 'some value', //offset to start query,
            'x-paging-limit': 'some value' //How many orders to fetch (max 100)
      };
      return this.sendApiRequest('get', url, headers, {});
  }

  getMyTransaction() {
      const url = `${this.protocol}//${this.hostname}/api/v1/broker/my-transactions`;
      const headers = {
            'x-sid': 'sessionid',
            'x-paging-start': 'some value', //offset to start query,
            'x-paging-limit': 'some value' //How many orders to fetch (max 100)
      };
      return this.sendApiRequest('get', url, headers, {});
  }

  getMyTrades() {
      const url = `${this.protocol}//${this.hostname}/api/v1/broker/my-trades`;
      const headers = {
            'x-sid': 'sessionid',
            'x-paging-start': 'some value', //offset to start query,
            'x-paging-limit': 'some value' //How many orders to fetch (max 100)
      };
      return this.sendApiRequest('get', url, headers, {});
  }

  createTOTP() {
      const url = `${this.protocol}//${this.hostname}/api/v1/user/totp/create`;
      const headers = {
            'x-sid': 'sessionid', //login session id,
      };
      return this.sendApiRequest('post', url, headers, {});
  }

  convertTOTPToQRImage(url) {
      const url = `${this.protocol}//${this.hostname}/api/v1/qr/${url}`;
      const headers = {
            'x-sid': 'sessionid', //login session id,
      };
      return this.sendApiRequest('get', url, headers, {});
  }

  deleteTOTP() {
      const url = `${this.protocol}//${this.hostname}/api/v1/user/totp/create`;
      const headers = {
            'x-sid': 'sessionid', //login session id,
            'x-totp': 'the 2FA'
      };
      return this.sendApiRequest('post', url, headers, {});
  }

  rescueTOTP() {
      const url = `${this.protocol}//${this.hostname}/api/v1/user/totp/rescue`;
      const headers = {
          'x-sid': 'sessionid', //login session id,
      };
      const body = { rescue: "QGM*iUMxmZ*6tgMN@j*H" };
      return this.sendApiRequest('post', url, headers, body);
  }

  createAnOrder(order) {
      const url = `${this.protocol}//${this.hostname}/api/v1/broker/cml`;
      const headers = {
            'x-sid': 'sessionid', //login session id,
      };
      const body = {
            "action": "create-order",
            "orders" : order
      };
      return this.sendApiRequest('post', url, headers, body);
  }

  cancelAnOrder(orderId) {
      const url = `${this.protocol}//${this.hostname}/api/v1/broker/cml`;
      const headers = {
            'x-sid': 'sessionid', //login session id,
      };
      return this.sendApiRequest('post', url, headers, orderId);
  }

  cancelOrderById(orderId) {
      const url = `${this.protocol}//${this.hostname}/api/v1/broker/orders/${orderId}`;
      const headers = {
          'x-sid': 'sessionid', //login session id,
      };
      return this.sendApiRequest('delete', url, headers, {});
  }

  createAPIKey() {
      const url = `${this.protocol}//${this.hostname}/api/v1/user/api-key/create`;
      const headers = {
          'x-sid': 'sessionid', //login session id,
          'x-totp': 'the 2FA'
      };
      return this.sendApiRequest('post', url, headers, {});
  }

  setAPIKey(body) {
      const url = `${this.protocol}//${this.hostname}/api/v1/user/api-key/name`;
      const headers = {
          'x-sid': 'sessionid', //login session id,
        };
      return this.sendApiRequest('post', url, headers, body);
  }

  getAPIKeyList() {
      const url = `${this.protocol}//${this.hostname}/api/v1/user/api-key/list`;
      const headers = {
          'x-sid': 'sessionid', //login session id,
      };
      return this.sendApiRequest('get', url, headers, {});
  }

  getAPIkey() {
      const url = `${this.protocol}//${this.hostname}/api/v1/user/api-key`;
      const headers = {
          'x-sid': 'sessionid', //login session id,
          'x-totp': '2FA'
      };
      return this.sendApiRequest('get', url, headers, {});
  }

  getAPIToken(body) {
      const url = `${this.protocol}//${this.hostname}/api/v1/user/api-key`;
      return this.sendApiRequest('post', url, headers, body);
  }

  createDepositeAddress(currency) {
      const url = `${this.protocol}//${this.hostname}/api/v1/wallet/${currency}/create`;
      const headers = {
          'x-sid': 'sessionid', //login session id,
      };
      return this.sendApiRequest('post', url, headers, {});
  }

  getMyDepositeAccount() {
      const url = `${this.protocol}//${this.hostname}/api/v1/wallet/${currency}/addresses`;
      const headers = {
          'x-sid': 'sessionid', //login session id,
       };
      return this.sendApiRequest('get', url, headers, {});
  }

  getTradeHistory(secondary, primary, size) {
      const url = `${this.protocol}//${this.hostname}/api/v1/analysis/trade-history/${secondary}/${primary}/${size}`;
      const headers = {
          'x-sid': 'sessionid', //login session id,
          'x-start': 'start datetime to query from',
          'x-end': 'end date to query to'
      };
      return this.sendApiRequest('get', url, headers, {});
  }

  getEquityCurve() {
      const url = `${this.protocol}//${this.hostname}/api/v1/analysis/equity/curve`;
      const headers = {
          'x-sid': 'sessionid', //login session id,
          'x-currency': 'currency to base curve on',
          'x-start': 'start datetime to query from',
          'x-end': 'end date to query to'
      };
      return this.sendApiRequest('get', url, headers, {});
  }

  getCurrentEquity() {
      const url = `${this.protocol}//${this.hostname}/api/v1/analysis/equity/curve`;
      const headers = {
          'x-sid': 'sessionid', //login session id,
          'x-currency': 'currency to base curve on',
      };
      return this.sendApiRequest('get', url, headers, {});
  }

  getCurrentPosition(range) {
      const url = `${this.protocol}//${this.hostname}/api/v1/analysis/positions/${range}`;
      const headers = {
          'x-sid': 'sessionid', //login session id,
      };
      return this.sendApiRequest('get', url, headers, {});
  }

  login(user) {
        const url = `${this.protocol}//${this.hostname}/api/v1/user/login`;
        return this.sendApiRequest('post', url, {}, user);
  }

  register(user) {
        const url = `${this.protocol}//${this.hostname}/api/v1/user/create`;
        return this.sendApiRequest('post', url, {}, user);
    }
};
