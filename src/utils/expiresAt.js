module.exports = function(res, expires_at) {
    return {...res, ...expires_at};
};