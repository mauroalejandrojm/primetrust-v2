var isStream = require("is-stream");

module.exports = function(obj) {
  return isStream(obj) && typeof obj.getBoundary === "function";
};
