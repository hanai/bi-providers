var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toESM = (module2, isNodeMode) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", !isNodeMode && module2 && module2.__esModule ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __toCommonJS = /* @__PURE__ */ ((cache) => {
  return (module2, temp) => {
    return cache && cache.get(module2) || (temp = __reExport(__markAsModule({}), module2, 1), cache && cache.set(module2, temp), temp);
  };
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var src_exports = {};
__export(src_exports, {
  ftx: () => ftx_exports,
  registerLoggerCreator: () => registerLoggerCreator
});

// src/providers/ftx/index.ts
var ftx_exports = {};
__export(ftx_exports, {
  MarketsClient: () => markets_default,
  OrdersClient: () => orders_default,
  Stream: () => Stream,
  WalletClient: () => wallet_default
});

// src/providers/ftx/utils/axios.ts
var import_axios2 = __toESM(require("axios"));

// src/providers/ftx/config.ts
var authRequired = [
  "GET:^\\/wallet\\/balances",
  "GET:^\\/orders",
  "POST:^\\/orders",
  "DELETE:^\\/orders",
  "GET:^\\/orders\\/history",
  "DELETE:^\\/orders\\/by_client_id\\/.+"
];
var config = {
  authRequired
};
var config_default = config;

// src/providers/ftx/utils/sign.ts
var import_crypto = __toESM(require("crypto"));
var generateSign = (params) => {
  const msg = `${params.timestamp}${params.method.toUpperCase()}/api${params.url}${params.body != null && Object.keys(params.body).length ? JSON.stringify(params.body) : ""}`;
  const sign = import_crypto.default.createHmac("sha256", params.token).update(msg).digest("hex");
  return sign;
};
var generateWebSocketSign = (params) => {
  const msg = `${params.timestamp}websocket_login`;
  const sign = import_crypto.default.createHmac("sha256", params.token).update(msg).digest("hex");
  return sign;
};

// src/providers/ftx/utils/interceptors/auth.ts
var auth_default = (ftxConfig, axiosConfig) => {
  const { ftxKey, ftxToken, ftxSubAccount } = ftxConfig;
  const { method, url = "", headers = {} } = axiosConfig;
  const shortUrl = url.replace(/^(https?:)?\/\/[^/]+/, "");
  const needAuth = config_default.authRequired.some((e) => {
    const [m, r] = e.split(":");
    if (m === (method == null ? void 0 : method.toUpperCase())) {
      const reg = new RegExp(r);
      return reg.test(shortUrl);
    }
    return false;
  });
  if (needAuth) {
    const ts = Date.now();
    headers["FTX-KEY"] = ftxKey;
    headers["FTX-TS"] = ts.toString();
    headers["FTX-SIGN"] = generateSign(Object.assign({
      timestamp: ts,
      method,
      url: shortUrl,
      token: ftxToken
    }, ["POST", "DELETE"].includes((method == null ? void 0 : method.toUpperCase()) || "") ? {
      body: axiosConfig.data || {}
    } : null));
    headers["Content-Type"] = "application/json";
    if (ftxSubAccount != null && ftxSubAccount !== "") {
      headers["FTX-SUBACCOUNT"] = ftxSubAccount;
    }
  }
  return axiosConfig;
};

// src/providers/ftx/utils/interceptors/res.ts
var import_lodash = __toESM(require("lodash"));
var import_axios = __toESM(require("axios"));

// src/utils/logger.ts
var import_debug = __toESM(require("debug"));
var _creator = (name, label) => {
  const logger2 = (0, import_debug.default)(`${name}${typeof label === "string" ? `:${label}` : ""}`);
  return {
    error: logger2.bind(null, "error"),
    info: logger2.bind(null, "info"),
    warn: logger2.bind(null, "warn")
  };
};
var createLogger = (name, label) => {
  return _creator(name, label);
};
var registerLoggerCreator = (creator) => {
  _creator = creator;
};

// src/providers/ftx/types.ts
var ApiError = class extends Error {
  constructor(args) {
    const { status, data, error } = args;
    const isUnknownError = typeof (data == null ? void 0 : data.error) !== "string";
    const errorMessage = isUnknownError ? "Unknown error" : data.error;
    super(errorMessage);
    if (isUnknownError) {
      this.originalError = error;
    }
    this.data = data;
    this.status = status;
  }
};
var FtxStreamError = class extends Error {
  constructor(args) {
    const { code, error } = args;
    super(code);
    this.code = code;
    this.originalError = error;
  }
};

// src/providers/ftx/utils/interceptors/res.ts
var logger;
var onResponseFulfilled = (res) => {
  const data = res.data;
  return data.result;
};
var onResponseRejected = (err) => {
  var _a, _b;
  if (!logger) {
    logger = createLogger("ftx");
  }
  if (import_axios.default.isAxiosError(err)) {
    const {
      config: { baseURL, data: reqData, headers, method, url, params },
      response: { status, data: resData, headers: resHeaders } = {}
    } = err;
    logger.error({
      req: {
        url: `${baseURL}${url}`,
        data: reqData,
        params,
        headers: import_lodash.default.pick(headers, ["FTX-SUBACCOUNT", "method", "url"]),
        method
      },
      res: {
        status,
        data: resData,
        headers: import_lodash.default.pick(resHeaders, [
          "account-id",
          "connection",
          "content-length",
          "content-type"
        ])
      }
    });
  } else {
    logger.error({
      error: err
    });
  }
  throw new ApiError({
    data: (_a = err.response) == null ? void 0 : _a.data,
    status: (_b = err.response) == null ? void 0 : _b.status,
    error: err
  });
};

// src/providers/ftx/utils/interceptors/proxy.ts
var import_https_proxy_agent = require("https-proxy-agent");
var ClientCache = /* @__PURE__ */ new Map();
var proxy_default = (ftxConfig, axiosConfig) => {
  if (typeof ftxConfig.httpProxy === "string") {
    let client = ClientCache.get(ftxConfig.httpProxy);
    if (client == null) {
      client = new import_https_proxy_agent.HttpsProxyAgent(ftxConfig.httpProxy);
      ClientCache.set(ftxConfig.httpProxy, client);
    }
    axiosConfig.httpsAgent = client;
  }
  return axiosConfig;
};

// src/providers/ftx/utils/axios.ts
var oldCreate = import_axios2.default.create;
var createClient = (axiosConfig, ftxConfig) => {
  const client = oldCreate(__spreadValues({
    timeout: 15e3
  }, axiosConfig));
  client.interceptors.request.use(auth_default.bind(null, ftxConfig));
  client.interceptors.request.use(proxy_default.bind(null, ftxConfig));
  client.interceptors.response.use(onResponseFulfilled, onResponseRejected);
  if (ftxConfig.dryRun) {
    client.post = (...args) => Promise.resolve();
    client.delete = (...args) => Promise.resolve();
  }
  return client;
};

// src/providers/ftx/api/markets.ts
var MarketsClient = class {
  constructor(ftxConfig) {
    this.getMarkets = () => {
      return this.axiosClient.get("/markets");
    };
    this.getSingleMarket = (params) => {
      const { name } = params;
      const url = `/markets/${name}`;
      return this.axiosClient.get(url);
    };
    this.getOrderBook = (params) => {
      const { name, depth = 20 } = params;
      const url = `/markets/${name}/orderbook?depth=${depth}`;
      return this.axiosClient.get(url);
    };
    this.axiosClient = createClient({
      baseURL: "https://ftx.com/api"
    }, ftxConfig);
  }
};
var markets_default = MarketsClient;

// src/providers/ftx/api/orders.ts
var import_lodash2 = __toESM(require("lodash"));
var import_retry_when = __toESM(require("retry-when"));
var import_promise_rate_limiter = __toESM(require("@hanai/promise-rate-limiter"));

// src/providers/ftx/constants.ts
var PLACE_ORDER_LIMIT_TIMEOUT = 200;

// src/providers/ftx/api/orders.ts
var canRetryPlaceOrder = (err) => err instanceof ApiError && [429, 503].includes(err.status);
var MAX_RETRY_COUNT = 3;
var OrdersClient = class {
  constructor(ftxConfig) {
    this.axiosClient = createClient({
      baseURL: "https://ftx.com/api"
    }, ftxConfig);
    this._placeOrder = (0, import_promise_rate_limiter.default)(this._placeOrder.bind(this), PLACE_ORDER_LIMIT_TIMEOUT);
  }
  _placeOrder(params) {
    return this.axiosClient.post("/orders", __spreadValues({}, params));
  }
  batchPlaceOrder(orders, opts) {
    return __async(this, null, function* () {
      const { autoRetry = false } = opts || {};
      if (orders.length) {
        const resList = [];
        for (let i = 0; i < orders.length; i++) {
          const order = orders[i];
          try {
            const res = yield this._placeOrder(order);
            resList.push(res);
          } catch (err) {
            if (err instanceof ApiError) {
              resList.push(err);
            } else {
              resList.push(new ApiError({
                data: {
                  success: false,
                  error: JSON.stringify(err)
                }
              }));
            }
          }
        }
        if (autoRetry) {
          for (let retryCount = 0; retryCount < MAX_RETRY_COUNT; retryCount++) {
            for (let i = 0; i < resList.length; i++) {
              const item = resList[i];
              if (canRetryPlaceOrder(item)) {
                const order = orders[i];
                try {
                  const res = yield this._placeOrder(order);
                  resList[i] = res;
                } catch (err) {
                  if (err instanceof ApiError) {
                    resList[i] = err;
                  } else {
                    throw err;
                  }
                }
              }
            }
          }
        }
        if (resList.filter((e) => import_lodash2.default.isError(e)).length) {
          throw resList;
        } else {
          return resList;
        }
      } else {
        return [];
      }
    });
  }
  placeOrder(params, opts) {
    return __async(this, null, function* () {
      const { autoRetry = false } = opts || {};
      return (0, import_retry_when.default)({
        func: this._placeOrder.bind(this),
        when: (err, res, { retryCount }) => autoRetry && err != null && canRetryPlaceOrder(err) && retryCount <= MAX_RETRY_COUNT,
        delayGenerator: () => 0
      })(params);
    });
  }
  getOrderHistory(params) {
    const _a = params, { startTime, endTime } = _a, otherParams = __objRest(_a, ["startTime", "endTime"]);
    return this.axiosClient.get("/orders/history", {
      params: __spreadValues({
        start_time: startTime,
        end_time: endTime
      }, otherParams)
    });
  }
  getOpenOrders(params) {
    return this.axiosClient.get("/orders", {
      params
    });
  }
  cancelAllOrders(params) {
    return this.axiosClient.delete("/orders", {
      data: params
    });
  }
  cancelOrderByClientId(clientId) {
    if (clientId.indexOf("/") > -1) {
      throw new Error("clientId cannot contain char /");
    }
    return this.axiosClient.delete(`/orders/by_client_id/${clientId}`);
  }
};
var orders_default = OrdersClient;

// src/providers/ftx/api/wallet.ts
var WalletClient = class {
  constructor(ftxConfig) {
    this.getBalance = () => {
      return this.axiosClient.get("/wallet/balances");
    };
    this.axiosClient = createClient({
      baseURL: "https://ftx.com/api"
    }, ftxConfig);
  }
};
var wallet_default = WalletClient;

// src/providers/ftx/stream/index.ts
var import_events = __toESM(require("events"));
var import_ws = __toESM(require("ws"));
var import_https_proxy_agent2 = require("https-proxy-agent");
var debug2 = require("debug")("ftx:stream");
var DEFAULT_ENDPOINT = "wss://ftx.com/ws/";
var DEFAULT_MAX_RETRY_COUNT = 5;
var DEFAULT_PING_INTERVAL = 12e3;
var DEFAULT_RECONNECT_TIMEOUT = 5e3;
var Stream = class extends import_events.default {
  constructor(config2) {
    super();
    this.subs = [];
    this.logger = createLogger("ftx");
    this.retryCount = 0;
    this.buildAuthMsg = () => {
      const ts = Date.now();
      const sign = generateWebSocketSign({
        timestamp: ts,
        token: this.config.ftxToken
      });
      return {
        op: "login",
        args: {
          key: this.config.ftxKey,
          sign,
          time: ts,
          subaccount: this.config.ftxSubAccount
        }
      };
    };
    this.config = Object.assign({}, {
      maxRetryCount: DEFAULT_MAX_RETRY_COUNT,
      endpoint: DEFAULT_ENDPOINT,
      pingInterval: DEFAULT_PING_INTERVAL,
      reconnectTimeout: DEFAULT_RECONNECT_TIMEOUT
    }, config2);
  }
  send(message) {
    var _a;
    try {
      const msg = typeof message === "string" ? message : JSON.stringify(message);
      (_a = this.ws) == null ? void 0 : _a.send(msg);
    } catch (err) {
      this.logger.error({
        tag: "WebSocket send error",
        error: err
      });
    }
  }
  sendPing() {
    this.send({
      op: "ping"
    });
  }
  startKeepAlive() {
    const { pingInterval } = this.config;
    if (this.keepAliveTimer != null)
      return;
    this.sendPing();
    this.keepAliveTimer = setInterval(() => {
      this.sendPing();
    }, pingInterval);
  }
  stopKeepAlive() {
    if (this.keepAliveTimer != null) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = void 0;
    }
  }
  reset() {
    this.subs = [];
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = void 0;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = void 0;
    }
    this.ws = void 0;
    this.retryCount = 0;
  }
  auth() {
    this.subs.push({
      subMsg: this.buildAuthMsg
    });
    this.send(this.buildAuthMsg());
  }
  subscribeChannel(channel, data, filter, cb) {
    const msg = __spreadValues({
      op: "subscribe",
      channel
    }, data);
    this.subs.push({
      subMsg: () => msg,
      cb,
      filter
    });
    this.send(msg);
  }
  connect() {
    const { httpProxy, endpoint } = this.config;
    return new Promise((resolve, reject) => {
      const ws = this.ws = new import_ws.default(endpoint, {
        perMessageDeflate: false,
        agent: httpProxy != null && httpProxy !== "" ? new import_https_proxy_agent2.HttpsProxyAgent(httpProxy) : void 0
      });
      let opened = false;
      ws.on("open", () => {
        opened = true;
        this.onWSOpen();
        resolve();
      });
      ws.on("error", (err) => {
        if (!opened) {
          reject(err);
        }
        this.onWSError(err);
      });
      ws.on("close", this.onWSClose.bind(this));
      ws.on("message", this.onWSMessage.bind(this));
    });
  }
  disconnect() {
    var _a;
    (_a = this.ws) == null ? void 0 : _a.close(1e3);
    this.reset();
  }
  onWSOpen() {
    debug2("onWSOpen");
    this.startKeepAlive();
  }
  onWSClose(code, reason) {
    debug2("onWSClose", code, reason == null ? void 0 : reason.toString());
    const { reconnectTimeout } = this.config;
    this.stopKeepAlive();
    if (code === 1e3) {
      this.logger.info({
        tag: "WebSocket closed normally",
        code,
        reason
      });
    } else {
      this.logger.error({
        tag: "WebSocket closed abnormally",
        code,
        reason
      });
      this.reconnectTimer = setTimeout(() => {
        this.tryReconnect(code);
      }, reconnectTimeout);
    }
  }
  onWSError(err) {
    debug2("onWSError", err);
    this.logger.error({
      tag: "WebSocket error",
      error: err
    });
  }
  tryReconnect(e) {
    return __async(this, null, function* () {
      debug2("tryReconnect", e);
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = void 0;
      }
      const { maxRetryCount } = this.config;
      if (this.retryCount < maxRetryCount) {
        this.retryCount++;
        yield this.reconnect(e);
      } else {
        this.logger.error({
          tag: "WebSocket exceeded max retry count",
          error: e
        });
        this.emit("error", new FtxStreamError({
          code: "EXCEEDED_MAX_RETRY_COUNT" /* EXCEEDED_MAX_RETRY_COUNT */,
          error: e
        }));
      }
    });
  }
  reconnect(e) {
    return __async(this, null, function* () {
      debug2("reconnect", e);
      const { reconnectTimeout } = this.config;
      try {
        yield this.connect();
        this.subs.forEach((item) => {
          const msg = item.subMsg();
          this.send(msg);
        });
        this.retryCount = 0;
      } catch (err) {
        this.logger.error({
          tag: "WebSocket reconnect failed",
          error: err
        });
        this.reconnectTimer = setTimeout(() => {
          this.tryReconnect(err);
        }, reconnectTimeout);
      }
    });
  }
  onWSMessage(data) {
    try {
      const json = JSON.parse(data.toString());
      this.subs.forEach((item) => {
        if (item.filter && item.cb && item.filter(json)) {
          item.cb(json);
        }
      });
    } catch (err) {
      this.logger.error({
        tag: "WebSocket onmessage error",
        error: err
      });
    }
  }
};
module.exports = __toCommonJS(src_exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ftx,
  registerLoggerCreator
});
