var fetch = require("node-fetch").default;
var formurlencoded = require("form-urlencoded").default;
var assign = Object.assign;
var invariant = require("invariant");
var rejectEmptyKeys = require("../utils/rejectEmptyKeys");
var toJson = require("../utils/toJson");
var snakifyKeys = require("../utils/snakifyKeys");
var Promise = require("bluebird");
const { base64 } = require("ethers/lib/utils");

fetch.Promise = Promise;

function errorFrom(parsedRes) {
  var error = new Error(JSON.stringify(parsedRes));
  error.error = parsedRes.error;
  error.error_description = parsedRes.error_description;
  error.error_uri = parsedRes.error_uri;
  return error;
}

function handleTokenResponse(client, res) {
  if (res.error) {
    return Promise.reject(errorFrom(res));
  }
  return new client.Token(res);
}

function performOnGrantCallback(client, token) {
  if (client.onGrant) {
    return client.onGrant(token).then(function() {
      return token;
    });
  }
  return token;
}

function requestToken(client, params) {
  return fetch(client.tokenUrl, {
    method: "POST",
    headers: {
      "Authorization": "Basic " + base64.encode(`${client.username}:${client.password}`),
      "content-type": "application/x-www-form-urlencoded",
      "user-agent": require("../../src/primetrust/userAgent")
    },
    body: formurlencoded(
      assign(
        {
          expires_at: client.expires_at,
        },
        params
      )
    )
  })
    .then(toJson)
    .then(handleTokenResponse.bind(null, client))
    .then(performOnGrantCallback.bind(null, client));
}

function refreshGrant(client, token) {
  return requestToken(client, {
    refresh_token: token.refresh_token
  });
}

function query(client, opts) {
  return formurlencoded(
    rejectEmptyKeys({
      response_type: "code",
      client_id: client.id,
      client_expires_at: client.expires_at,
      redirect_uri: opts.redirect_uri,
      scope: opts.scope,
      state: opts.state,
      verified_account: opts.verified_account
    })
  );
}

function AuthClass(client, opts) {
  if (typeof opts === "undefined") {
    opts = {};
  }
  this.client = client;
  this.redirect_uri = opts.redirect_uri;
  this.scope = opts.scope;
  this.state = opts.state;
  this.verified_account = opts.verified_account;
  this.url = [client.authUrl, query(client, opts)].join("?");
}

AuthClass.prototype.callback = function(params) {
  invariant(params.state === this.state, "Invalid state parameter.");
  if (params.error) {
    throw params;
  }
  return requestToken(this.client, {
    code: params.code,
    redirect_uri: this.redirect_uri
  });
};

module.exports = function(client) {
  var klass = AuthClass.bind(null, client);
  var methods = function(opts) {
    snakifyKeys(opts);
    return new klass(opts);
  };
  methods.client = requestToken.bind(null, client, {});
  methods.refresh = refreshGrant.bind(null, client);
  return {
    klass: klass,
    methods: methods
  };
};
