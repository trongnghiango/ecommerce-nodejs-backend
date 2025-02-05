const JWT = require('jsonwebtoken');
const { catchAsync } = require('../utils/helper.util');
const ApiError = require('../core/api-error');
const { getKeyToken } = require('../services/keytoken.service');
const { logger } = require('../utils/logger.util');

const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization'
}

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

const authentication = catchAsync(async (req, res, next) => { /* dung ham bao catchAsync de co the throw Error */
  /**
   * Flow:
   * 1. check userId 
   * 2. get accessToken
   * 3. verifyToken 
   * 4. check user existed in dbs
   * 5. check keyStore with this userId
   * 6.  Ok all => return next()
   */

  // 1.
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw ApiError.unAuthorized('Invalid request!')

  // call srv -> 
  const [er, keyStore] =  await getKeyToken({userId})
  if (er || !keyStore) throw ApiError.notFound('Not found keyStore!')
    // logger.info(keyStore?.publicKey)

  const accessToken = req.headers[HEADER.AUTHORIZATION]
  if (!accessToken) throw ApiError.unAuthorized('Invalid request!!')

  const [err, decodeUser] = await decodeToken( accessToken, keyStore?.publicKey)
  if (err) throw err

  if(userId !== decodeUser.userId) throw ApiError.unAuthorized('invalid user')

  req.keyStore = keyStore;

  return next();

})

module.exports = {
  createTokenPair,
  decodeToken,
  authentication,
};
