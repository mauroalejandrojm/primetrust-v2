var invariant = require("invariant");
var auth = require("./Auth");
var Token = require("./Token");
var isOneOfTypes = require("../utils/isOneOfTypes");
var snakifyKeys = require("../utils/snakifyKeys");
var TokenManager = require("./TokenManager");
var crypto = require("crypto");

var DEFAULT_ENVIRONMENT = "sandbox";
const DEFAULT_SERVICE_UUID = crypto.randomUUID();

var ENVIRONMENTS = {
  production: {
    authUrl: "https://api.primetrust.com/auth/jwts",
    tokenUrl: "https://api.primetrust.com/v2/resource-tokens",
    apiUrl: "https://api.primetrust.com"
  },
  sandbox: {
    authUrl: "https://sandbox.primetrust.com/auth/jwts",
    tokenUrl: "https://sandbox.primetrust.com/v2/resource-tokens",
    apiUrl: "https://sandbox.primetrust.com"
  }
};

function Client(opts) {
  invariant(typeof opts === "object", "First argument must be an object.");

  this.userId = this.userId || DEFAULT_SERVICE_UUID;
  this.username = opts.username;
  this.password = opts.password;
  this.environment = opts.environment || DEFAULT_ENVIRONMENT;
  this.onGrant = opts.onGrant;

  invariant(typeof ths.userId === "string", "userId is required.");
  invariant(typeof opts.username === "string", "username is required.");
  invariant(typeof opts.password === "string", "password is required.");
  invariant(this.environment in ENVIRONMENTS, "Invalid environment.");
  invariant(
    isOneOfTypes(opts.onGrant, ["undefined", "function"]),
    "Invalid onGrant."
  );

  this.authUrl = ENVIRONMENTS[this.environment].authUrl;
  this.tokenUrl = ENVIRONMENTS[this.environment].tokenUrl;
  this.apiUrl = ENVIRONMENTS[this.environment].apiUrl;

  var self = this;
  var thisAuth = auth(this);

  this.auth = thisAuth.methods;
  this.Auth = thisAuth.klass;
  this.Token = Token.bind(null, this);

  var getToken = TokenManager(this).getToken;

  this.get = function() {
    var getArgs = arguments;
    return getToken().then(function(token) {
      return token.get.apply(token, getArgs);
    });
  };

  this.post = function() {
    var postArgs = arguments;
    return getToken().then(function(token) {
      return token.post.apply(token, postArgs);
    });
  };

  this.delete = function() {
    var deleteArgs = arguments;
    return getToken().then(function(token) {
      return token.delete.apply(token, deleteArgs);
    });
  };

  this.refreshToken = function(opts) {
    snakifyKeys(opts);
    return thisAuth.methods.refresh(new self.Token(opts));
  };

  this.token = function(opts) {
    snakifyKeys(opts);
    return new self.Token(opts);
  };

}

if (process.env.NODE_ENV === "test") {
  Client.ENVIRONMENTS = ENVIRONMENTS;
}

module.exports = Client;
