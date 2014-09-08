'use strict';

var url = require('url');
var assert = require('assert');
var parseLinks = require('parse-links');
var barrage = require('barrage');
var Promise = require('promise');

var HTTP_METHODS = ['head', 'get', 'delete', 'post', 'patch', 'put'];
var LINK_TYPES = ['Next', 'Last', 'First', 'Prev'];

module.exports = Client;

function Client(options, request, wrap, when) {
  assert(options.version && typeof options.version === 'number', 'You must specify a version when connecting (e.g. `connect({version: 3})`)');
  this._version = 'application/vnd.github.v' + options.version + '+json';
  this._request = request;
  this._wrap = wrap;
  this._when = when;
  this._cache = options.cache;
  if (options.auth) {
    if (typeof options.auth === 'string') {
      this._authorization = 'token ' + options.auth;
    } else if (typeof options.auth === 'object' && typeof options.auth.username === 'string' && typeof options.auth.password === 'string') {
      this._authorization = 'Basic ' + new Buffer(options.auth.username + ':' + options.auth.password, 'ascii').toString('base64');
    } else {
      throw new Error('Auth type is not recognised.');
    }
  } else {
    this._authorization = null;
  }

  // Initial assumptions about rate limit
  this.rateLimit = {
    limit: 5000,
    remaining: 5000,
    reset: Math.floor(Date.now() / 1000) + (60 * 60)
  };
}
Client.prototype.requestBufferWithHeaders = function (method, path, query, callback) {
  if (typeof query === 'function' && typeof callback === 'undefined') callback = query, query = null;
  return nodeify(this._wrap(function () {
    assert(typeof method === 'string', 'method must be `head`, `get`, `delete`, `post`, `patch` or `put` but was ' + method);
    method = method.toLowerCase();
    assert(HTTP_METHODS.indexOf(method) != -1, 'method must be `head`, `get`, `delete`, `post`, `patch` or `put` but was ' + method);
    assert(typeof path === 'string', 'path must be a string')
    assert(query === undefined || query === null || typeof query === 'object', 'query must be an object or `null` but was ' + query);

    query = JSON.parse(JSON.stringify(query || {}))//clone and stringify dates
    path = path.replace(/\:([^\/\.]+)/g, function (_, key) {
      var res = query[key];
      delete query[key];
      return res;
    });
    path = url.resolve('https://api.github.com', path);

    var headers = {
      'user-agent': 'ForbesLindesay/github-basic',
      'accept': this._version
    };
    if (this._authorization) {
      headers['authorization'] = this._authorization;
    }

    var opts = {headers: headers, cache: this._cache};

    if ('head|get|delete'.indexOf(method) === -1) opts.json = query;
    else opts.qs = query;

    return this._when(this._request(method, path, opts), function (res) {
      if (res.headers['x-ratelimit-limit']) {
        this.rateLimit.limit = +res.headers['x-ratelimit-limit'];
      }
      if (res.headers['x-ratelimit-remaining']) {
        this.rateLimit.remaining = +res.headers['x-ratelimit-remaining'];
      }
      if (res.headers['x-ratelimit-reset']) {
        this.rateLimit.reset = +res.headers['x-ratelimit-reset'];
      }
      return res;
    }.bind(this));
  }.bind(this)), callback);
};
Client.prototype.requestBuffer = function (method, path, query, callback) {
  if (typeof query === 'function' && typeof callback === undefined) callback = query, query = null;
  return nodeify(this._when(this.requestBufferWithHeaders(method, path, query), function (res) {
    var body = res.getBody();
    if (res.headers.link) {
      var link = parseLinks(res.headers.link);
      for (var i = 0; i < LINK_TYPES.length; i++) {
        if (link[LINK_TYPES[i].toLowerCase()]) {
          body['get' + LINK_TYPES[i]] = this.requestBuffer.bind(this, 'get', link[LINK_TYPES[i].toLowerCase()], null);
        }
      }
    }
    return body;
  }.bind(this)), callback);
};
Client.prototype.requestJson = function (method, path, query, callback) {
  if (typeof query === 'function' && typeof callback === undefined) callback = query, query = null;
  return nodeify(this._when(this.requestBufferWithHeaders(method, path, query), function (res) {
    var body = JSON.parse(res.getBody());
    if (res.headers.link) {
      var link = parseLinks(res.headers.link);
      for (var i = 0; i < LINK_TYPES.length; i++) {
        if (link[LINK_TYPES[i].toLowerCase()]) {
          body['get' + LINK_TYPES[i]] = this.requestJson.bind(this, 'GET', link[LINK_TYPES[i].toLowerCase()], null);
        }
      }
    }
    return body;
  }.bind(this)), callback);
};

HTTP_METHODS.forEach(function (method) {
  Client.prototype[method] = function (path, query, callback) {
    return this.requestJson(method, path, query, callback);
  };
  Client.prototype[method + 'Buffer'] = function (path, query, callback) {
    return this.requestBuffer(method, path, query, callback);
  };
});


Client.prototype.getStream = function (path, query) {
  var next = this.requestJson.bind(this, 'get', path, query);
  var running = false;
  var source = new barrage.Readable({objectMode: true})
  source._read = function () {
    if (running) return;
    running = true;
    next().then(function (res) {
      next = res.getNext;
      var cont = true;
      for (var i = 0; i < res.length; i++) {
        cont = source.push(res[i]);
      }
      if (typeof next !== 'function') {
        return source.push(null);
      }
      running = false;
      if (cont) source._read();
    }).done(null, function (err) {
      source.emit('error', err);
      source.push(null);
      running = true;
    });
  }
  return source;
}

function nodeify(value, callback) {
  if (typeof callback === 'function')
    Promise.resolve(value).nodeify(callback);
  else
    return value;
}