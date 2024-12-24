const crypto = require('node:crypto');
const ApiError = require('../core/api-error');


const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req?.user?.role)) {
      throw ApiError.unAuthorized('Access Denied!')
    }
    next()
  }
}

/**
 * create {}
 * @returns {object}
 */
const genPairKey = () =>
    crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem',
      },
    })

module.exports = {
  genPairKey,
  authorizeRoles,
};
