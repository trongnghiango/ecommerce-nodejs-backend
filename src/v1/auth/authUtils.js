const JWT = require('jsonwebtoken');

const createTokenPair = (payload, privateKey) => {
  return new Promise((resolve, _reject) => {
    try {
      const accessToken = JWT.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '15m' });
      const refreshToken = JWT.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '7d' });

      const tokens = { accessToken, refreshToken };

      resolve([null, tokens]);
    } catch (error) {
      resolve([error, null]);
    }
  });
};

/**
 * @typedef {Object} KeyObject
 * @property {string} type - The type of the key (e.g., "public", "private").
 * @property {string} format - The format of the key (e.g., "pem", "der").
 * @property {Buffer} export - A method to export the key in different formats.
 */

/**
 *
 * @param {string} token -
 * @param {crypto.KeyObject} publicKey -
 * @returns
 */
const decodeToken = (token, publicKey) => {
  return new Promise((resolve, _reject) => {
    try {
      const payload = JWT.verify(token, publicKey);
      resolve([null, payload]);
    } catch (error) {
      resolve([error, null]);
    }
  });
};

module.exports = {
  createTokenPair,
  decodeToken,
};
