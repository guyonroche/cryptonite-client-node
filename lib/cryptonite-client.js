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
    const timestamp = new Date();
    const payload = JSON.stringify({ timestamp, nonce: Date.now() });
    const signature = hmacSign(this.apiSecret, payload);
    const wsProtocol = this.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${this.hostname}/api/ws?code=${this.apiKey}&payload=${encodeURIComponent(payload)}&signature=${signature}`;
    return new Promish(resolve => {
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
  close() {
    this.ws.close();
  }

  subscribe(channel, options) {
    const message = {
      msg: 'subscribe',
      channel,
      ...options,
    };

    this.ws.send(JSON.stringify(message), error => {
      if (error) {
        console.error(error.stack);
      }
    });
  }
  unsubscribe(channel, options) {
    const message = {
      msg: 'unsubscribe',
      channel,
      ...options,
    };

    this.ws.send(JSON.stringify(message), error => {
      if (error) {
        console.error(error.stack);
      }
    });
  }

  onDisconnect() {
    this.ws = null;
    this.emit('disconnected');
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

  wsCreateOrder(order) {
    const payload = JSON.stringify({
      action: 'create-order',
      timestamp: new Date(),
      nonce: this.nonce++,
      order,
    });
    this.brokerOrder(payload);
  }

  wsCancelOrder(orderId) {
    const payload = JSON.stringify({
      action: 'cancel-order',
      timestamp: new Date(),
      nonce: this.nonce++,
      orderId,
    });
    this.brokerOrder(payload);
  }
  wsCancelOrderByClientId(clientId) {
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

  sendApiRequest(method, url, headers = {}, json = {}) {
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
    return this.axios(config)
      .then(result => result.data);
  }

  getBalances() {
    const url = `${this.protocol}//${this.hostname}/api/v1/broker/balances`;
    return this.sendApiRequest('get', url);
  }

  getMyOrders(start, limit) {
    const url = `${this.protocol}//${this.hostname}/api/v1/broker/my-orders`;
    const headers = {
      'x-paging-start': start || 0, //offset to start query,
      'x-paging-limit': limit || 10 //How many orders to fetch (max 100)
    };
    return this.sendApiRequest('get', url, headers);
  }

  getMyTransactions(start, limit) {
    const url = `${this.protocol}//${this.hostname}/api/v1/broker/my-transactions`;
    const headers = {
      'x-paging-start': start, //offset to start query,
      'x-paging-limit': limit //How many orders to fetch (max 100)
    };
    return this.sendApiRequest('get', url, headers);
  }

  getMyTrades(start, limit) {
    const url = `${this.protocol}//${this.hostname}/api/v1/broker/my-trades`;
    const headers = {
      'x-paging-start': start, //offset to start query,
      'x-paging-limit': limit //How many orders to fetch (max 100)
    };
    return this.sendApiRequest('get', url, headers);
  }

  createOrder(order) {
    const url = `${this.protocol}//${this.hostname}/api/v1/broker/order`;
    const body = {
      action: 'create-order',
      order,
    };
    return this.sendApiRequest('post', url, {}, body);
  }
  createAnOrder(order) {
    console.warn('createAnOrder is deprecated. The function has been renamed to createOrder');
    return this.createOrder(order);
  }

  cancelOrder(orderId) {
    const url = `${this.protocol}//${this.hostname}/api/v1/broker/order`;
    const body = {
      action: 'cancel-order',
      orderId,
    };
    return this.sendApiRequest('post', url, {}, body);
  }
  cancelAnOrder(orderId) {
    console.warn('cancelAnOrder is deprecated. The function has been renamed to cancelOrder');
    return this.cancelOrder(orderId);
  }

  cancelMarketOrders(market) {
    const url = `${this.protocol}//${this.hostname}/api/v1/broker/order`;
    const body = {
      action: 'cancel-mkt-orders',
      market,
    };
    return this.sendApiRequest('post', url, {}, body);
  }

  cancelAllOrders() {
    const url = `${this.protocol}//${this.hostname}/api/v1/broker/order`;
    const body = {
      action: 'cancel-all-orders',
    };
    return this.sendApiRequest('post', url, {}, body);
  }

  getTradeHistory(secondary, primary, size, start, limit) {
    const url = `${this.protocol}//${this.hostname}/api/v1/analysis/trade-history/${secondary}/${primary}/${size}`;
    const headers = {
      'x-start': start,
      'x-end': limit
    };
    return this.sendApiRequest('get', url, headers);
  }

  getEquityCurve(currency, startDate, endDate) {
    const url = `${this.protocol}//${this.hostname}/api/v1/analysis/equity/curve`;
    const headers = {
      'x-currency': currency,
      'x-start': startDate,
      'x-end': endDate
    };
    return this.sendApiRequest('get', url, headers);
  }

  getCurrentEquity(currency) {
    const url = `${this.protocol}//${this.hostname}/api/v1/analysis/equity/curve`;
    const headers = {
      'x-currency': currency,
    };
    return this.sendApiRequest('get', url, headers);
  }

  getCurrentPosition(range) {
    const url = `${this.protocol}//${this.hostname}/api/v1/analysis/positions/${range}`;
    return this.sendApiRequest('get', url);
  }
};
