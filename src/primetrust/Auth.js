var fetch = require("node-fetch").default;
var formurlencoded = require("form-urlencoded").default;
var assign = Object.assign;
var invariant = require("invariant");
var rejectEmptyKeys = require("../utils/rejectEmptyKeys");
var toJson = require("../utils/toJson");
var expiresAt = require("../utils/expiresAt");
var snakifyKeys = require("../utils/snakifyKeys");
var Promise = require("bluebird");
var TokenManager = require("./TokenManager");
const DEFAULT_TOKEN_EXPIRATION = new Date(new Date().setMilliseconds(TokenManager().getTokenExpiration()));

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
  return fetch(client.authUrl, {
    method: "POST",
    headers: {
      "Authorization": "Basic " + Buffer.from(`${client.username}:${client.password}`).toString('base64'),
      "content-type": "application/x-www-form-urlencoded",
      "user-agent": require("../../src/primetrust/userAgent")
    },
    body: formurlencoded(
      assign(
        {
          expires_at: params.expires_at || DEFAULT_TOKEN_EXPIRATION,
        },
        params
      )
    )
  })
  .then(toJson)
  .then(expiresAt.bind(null, {expires_at:params.expires_at || DEFAULT_TOKEN_EXPIRATION}))
  .then(handleTokenResponse.bind(null, client))
  .then(performOnGrantCallback.bind(null, client));
}

function refreshGrant(client, token) {
  return requestToken(client, {
    grant_type: "refresh_token",
    token: token
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
