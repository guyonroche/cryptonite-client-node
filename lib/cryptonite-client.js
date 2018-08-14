const https = require('https');
const { EventEmitter } = require('events');
const Promish = require('promish');
const axios = require('axios');
const WebSocket = require('ws');

const hmacSign = require('./utils/hmac-sign');

module.exports = class CryptoniteClient extends EventEmitter {
  constructor({protocol = 'https:', hostname, apiKey, apiSecret, httpsAgent, options = {}}) {
    super();
    this.protocol = protocol;
    this.hostname = hostname;
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.httpsAgent = httpsAgent;
    this.verbose = options.verbose;
    this.nonce = Date.now() * 1000;

    this.axios = axios.create({
      httpsAgent: new https.Agent(this.httpsAgent),
    });

    this.wsActive = false;
  }

  // ==========================================================================
  // Web Socket API
  connect() {
    this.wsActive = true;

    const timestamp = new Date();
    const payload = JSON.stringify({ timestamp, nonce: this.nonce++ });
    const signature = hmacSign(this.apiSecret, payload);
    const wsProtocol = this.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${this.hostname}/api/ws?code=${this.apiKey}&payload=${encodeURIComponent(payload)}&signature=${signature}`;
    return new Promish((resolve, reject) => {
      let satisfied = false;
      try {
        this.ws = new WebSocket(wsUrl, this.httpsAgent);

        this.ws.on('message', m => {
          try {
            const message = JSON.parse(m);
            if (message.msg === 'ready') {
              satisfied = true;
              this.emit('ready');
              resolve();
            } else {
              this.emit('message', message);
            }
          } catch (error) {
            satisfied = true;
            reject(error);
          }
        });
        this.ws.on('open', () => this.onConnected());
        this.ws.on('close', () => this.onDisconnected());
        this.ws.on('error', error => {
          if (satisfied) {
            this.onDisconnected();
          } else {
            reject(error);
          }
        });
      } catch (e) {
        satisfied = true;
        reject(e);
      }
    });
  }
  reconnect() {
    if (this.isReconnecting) {
      return;
    }
    this.isReconnecting = 100;
    const attempt = () => {
      this.connect()
        .then(() => {
          this.isReconnecting = false;
        })
        .catch(() => {
          this.isReconnecting = Math.min(
            Math.floor(this.isReconnecting * 1.3),
            60000
          );
          Promish.delay(this.isReconnecting)
            .then(attempt);
        });
    };
    attempt();
  }
  close() {
    this.wsActive = false;
    this.ws.close();
  }
  onConnected() {
    this.emit('connected');
  }
  onDisconnected() {
    this.ws = null;
    this.emit('disconnected');
    if (this.wsActive) {
      this.reconnect();
    }
  }
  wsSend(message) {
    return new Promish((resolve, reject) => {
      this.ws.send(JSON.stringify(message), error => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }


  subscribe(channel, options) {
    const message = {
      msg: 'subscribe',
      channel,
      ...options,
    };

    return this.wsSend(message);
  }
  unsubscribe(channel, options) {
    const message = {
      msg: 'unsubscribe',
      channel,
      ...options,
    };

    return this.wsSend(message);
  }

  brokerOrder(payload) {
    const apiSignature = hmacSign(this.apiSecret, payload);
    const message = {
      msg: 'broker-order',
      apiKey: this.apiKey,
      payload,
      apiSignature,
    };

    return this.wsSend(message);
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

  wsCancelOrder(market, orderId) {
    const payload = JSON.stringify({
      action: 'cancel-order',
      timestamp: new Date(),
      nonce: this.nonce++,
      market,
      orderId,
    });
    this.brokerOrder(payload);
  }
  wsCancelOrderByClientId(market, clientId) {
    const payload = JSON.stringify({
      action: 'cancel-order',
      timestamp: new Date(),
      nonce: this.nonce++,
      market,
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

    if (this.verbose) {
      console.log('SND', method, url, payload);
    }

    return this.axios(config)
      .then(({data}) => {
        if (this.verbose) {
          console.log('RCV', JSON.stringify(data));
        }
        return data;
      });
  }

  getBalances() {
    const url = `${this.protocol}//${this.hostname}/api/v1/broker/balances`;
    return this.sendApiRequest('get', url);
  }

  getMyOrders(market, state = 'open', start = 0, limit = 10) {
    const url = `${this.protocol}//${this.hostname}/api/v1/broker/${market}/${state}/my-orders`;
    const headers = {
      'x-paging-start': start, //offset to start query,
      'x-paging-limit': limit //How many orders to fetch (max 100)
    };
    return this.sendApiRequest('get', url, headers);
  }

  getMyTransactions(currency, start, limit) {
    const url = `${this.protocol}//${this.hostname}/api/v1/broker/${currency}/my-transactions`;
    const headers = {
      'x-paging-start': start, //offset to start query,
      'x-paging-limit': limit //How many orders to fetch (max 100)
    };
    return this.sendApiRequest('get', url, headers);
  }

  getMyTrades(market, start = 0, limit = 10) {
    const url = `${this.protocol}//${this.hostname}/api/v1/broker/${market}/my-trades`;
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

  cancelOrder(market, orderId) {
    const url = `${this.protocol}//${this.hostname}/api/v1/broker/order`;
    const body = {
      action: 'cancel-order',
      market,
      orderId,
    };
    return this.sendApiRequest('post', url, {}, body);
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

  getTradeHistory(market, size, start, limit) {
    const url = `${this.protocol}//${this.hostname}/api/v1/analysis/trade-history/${market}/${size}`;
    const headers = {
      'x-start': start,
      'x-end': limit
    };
    return this.sendApiRequest('get', url, headers);
  }

  getTrades(market, start, limit) {
    const url = `${this.protocol}//${this.hostname}/api/v1/broker/${market}/trades`;
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
