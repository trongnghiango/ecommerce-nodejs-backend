const { CreatedResponse, OKResponse } = require('../core/success.response');
const AccessService = require('../services/access.service');
const { logger } = require('../utils/logger.util'); // Assuming logger is correctly set up
const { HEADER } = require('../auth/authUtils');

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('express').NextFunction} NextFunction
 * @typedef {import('../services/access.service').ShopSignupPayload} ShopSignupPayload
 * @typedef {import('../services/access.service').ShopSigninPayload} ShopSigninPayload
 * @typedef {import('../services/access.service').ShopSignupResponse} ShopSignupResponse
 * @typedef {import('../services/access.service').ShopSigninResponse} ShopSigninResponse
 */

class AccessController {
  /**
   * Handles shop signup.
   * @param {Request<{}, {}, ShopSignupPayload>} req - Express request object.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line class-methods-use-this
  signup = async (req, res, next) => {
    logger.info('AccessController::signup called', { body: req.body });
    /** @type {ShopSignupResponse} */
    const result = await AccessService.signup(req.body);
    new CreatedResponse({
      message: 'Shop registered successfully!',
      metadata: result,
    }).send(res);
  };

  /**
   * Handles shop signin.
   * @param {Request<{}, {}, ShopSigninPayload>} req - Express request object.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line class-methods-use-this
  signin = async (req, res, next) => {
    logger.info('AccessController::signin called', { email: req.body.email });
    /** @type {ShopSigninResponse} */
    const result = await AccessService.signin(req.body);
    new OKResponse({
      message: 'Shop signin successful!',
      metadata: result,
    }).send(res);
  };

  /**
   * Handles shop signout.
   * `req.keyStore` is populated by the `authentication` middleware.
   * @param {Request & { keyStore?: import('../services/keytoken.service').KeyToken }} req - Express request object.
   * @param {Response} res - Express response object.
   * @param {NextFunction} _next - Express next middleware function (unused).
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line class-methods-use-this
  signout = async (req, res, _next) => {
    logger.info('AccessController::signout called', { userId: req.keyStore?.userId });
    await AccessService.logout(req.keyStore); // Pass the entire keyStore object or just userId
    new OKResponse({
      message: 'Shop logout successful!',
    }).send(res);
  };

  /**
   * Handles token refresh.
   * `req.user` and `req.keyStore` are populated by authentication middleware (if needed for refresh logic).
   * `req.refreshToken` would be extracted from headers or body.
   * @param {Request & { user?: any, keyStore?: any, refreshToken?: string }} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line class-methods-use-this
  handleRefreshToken = async (req, res, next) => {
    const refreshToken = req.headers[HEADER.REFRESH_TOKEN] || req.body.refreshToken;
    if (!refreshToken) {
      throw ApiError.badRequest('Refresh token is missing.');
    }

    // Option 1: If refreshToken is self-contained and KeyStore is used for public key only for RT
    // const result = await AccessService.handleRefreshToken(refreshToken, req.keyStore.publicKey);

    // Option 2: If KeyStore stores active refresh tokens (more secure against replay if RTs are stored and validated)
    // This assumes KeyTokenService has a method to find KeyStore by RT or validate RT against stored ones.
    // And AccessService uses this information along with `req.user` and `req.keyStore`.
    const result = await AccessService.handleRefreshTokenV2({
      refreshToken,
      user: req.user, // from authentication of access token (if this route is protected) or decoded from RT
      keyStore: req.keyStore, // from authentication of access token
    });

    new OKResponse({
      message: 'Tokens refreshed successfully!',
      metadata: result,
    }).send(res);
  };
}

module.exports = new AccessController();
