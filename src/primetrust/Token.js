var fetch = require("node-fetch").default;
var formurlencoded = require("form-urlencoded").default;
var rejectEmptyKeys = require("../utils/rejectEmptyKeys");
var isFormData = require("../utils/isFormData");
var assign = Object.assign;
var Promise = require("bluebird");

fetch.Promise = Promise;

var Token = function (client, opts) {
  this.client = client;
  this.scope = opts.scope;
  this.token = opts.token;
  this.expires_at = opts.expires_at;
};

function getHeaders(token, moreHeaders) {
  return assign(
    {
      Authorization: ["Bearer", token.token].join(" "),
      Accept: "application/vnd.primetrust.v2.hal+json",
      "User-Agent": require("./userAgent")
    },
    moreHeaders
  );
}

function getUrl(token, suppliedPath, suppliedQuery) {
  var url;
  if (typeof suppliedPath === "object") {
    url = [token.client.apiUrl, suppliedPath?.links.self].join("");
  } else if (suppliedPath.indexOf(token.client.apiUrl) === 0) {
    url = suppliedPath;
  } else if (suppliedPath.indexOf("/") === 0) {
    url = [token.client.apiUrl, suppliedPath].join("");
  } else {
    url = [
      token.client.apiUrl,
      suppliedPath.replace(/^https?:\/\/[^\/]*\//, "")
    ].join("/");
  }
  var query = formurlencoded(rejectEmptyKeys(suppliedQuery || {}));
  return query ? [url, query].join("?") : url;
}

function errorFrom(message, parsedRes) {
  var error = new Error(message);
  error.status = parsedRes.status;
  error.headers = parsedRes.headers;
  error.body = parsedRes.body;
  return error;
}

function handleResponse(res) {
  return res.text().then(function (body) {
    var parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch (e) {
      parsedBody = body;
    }
    var parsedRes = {
      status: res.status,
      headers: res.headers,
      body: parsedBody
    };
    if (parsedRes.status >= 400) {
      return Promise.reject(errorFrom(body, parsedRes));
    }
    return parsedRes;
  });
}

Token.prototype.get = function (path, query, headers) {
  return fetch(getUrl(this, path, query),
    {
      headers: getHeaders(this, headers)
    })
    .then(handleResponse);
};

Token.prototype.post = function (path, body, headers) {
  return fetch(getUrl(this, path),
    {
      method: "POST",
      headers: assign(
        getHeaders(this, headers),
        isFormData(body)
          ? body.getHeaders()
          : { "content-type": "application/json" }
      ),
      body: isFormData(body) ? body : JSON.stringify(body)
    }).then(handleResponse);
};

Token.prototype.patch = function (path, body, headers) {
  return fetch(getUrl(this, path),
    {
      method: "PATCH",
      headers: assign(
        getHeaders(this, headers),
        isFormData(body)
          ? body.getHeaders()
          : { "content-type": "application/json" }
      ),
      body: isFormData(body) ? body : JSON.stringify(body)
    }).then(handleResponse);
};

Token.prototype.delete = function (path, query, headers) {
  return fetch(getUrl(this, path, query),
    {
      method: "DELETE",
      headers: getHeaders(this, headers)
    }).then(handleResponse);
};

Token.prototype.headers = function (headers) {
  return { headers: getHeaders(this, headers) };
}

module.exports = Token;
