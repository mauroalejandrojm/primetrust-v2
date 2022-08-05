var Promise = require("bluebird");
var expiresAt = require("../utils/expiresAt");
var EXPIRES_IN = 28800000;

function now() {
  return new Date(Date.now());
}

module.exports = function TokenManager(client, initialState) {
  
    var state = Object.assign(
      { instance: null, expires_at: null, updated_at: null },
      initialState
    );
  
    var updateToken = function() {
      state.updatedAt = now();
      state.expires_at = new Date(new Date().setMilliseconds(EXPIRES_IN));
      state.instance = client.auth.client().then(
        function(token) {
          state.expires_at = token.expires_at || state.expires_at;
          return token;
        },
        function(err) {
          state.instance = null;
          return Promise.reject(err);
        }
      );
    };
  
    var isTokenFresh = function() {
      return (
        state.expires_at === null || // token is updating
        state.updated_at + state.expires_at > new Date(new Date().setMilliseconds(EXPIRES_IN))
      );
    };
  
    return {
      getToken: function() {
        if (state.instance === null || !isTokenFresh()) {
          updateToken();
        }
        return state.instance;
      },
      getTokenExpiration: function() {
        return EXPIRES_IN;
      },
      _state: state
    };
  };