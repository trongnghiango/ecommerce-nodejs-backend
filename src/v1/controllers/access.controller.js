const ApiError = require('../core/api-error');
const { CreatedResponse, OKResponse } = require('../core/success.response');
const AccessService = require('../services/access.service');
const { logger } = require('../utils/logger.util');

class AccessController {
  /**
   *
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  // eslint-disable-next-line class-methods-use-this
  signup = async (req, res, next) => {
    // throw ApiError.badRequest('ciquan');
    const [err, result] = await AccessService.signup(req.body);
    logger.info(err);

    if (err) throw ApiError.badRequest(err.message);

    return new CreatedResponse({
      message: 'Registed OK!!',
      metadata: result,
    }).send(res);
    // return res.status(201).json({
    //   code: 'Created',
    //   msg: 'oo',
    //   result,
    // });
  };

  /**
   *
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  // eslint-disable-next-line class-methods-use-this
  signin = async (req, res, next) => {
    // throw ApiError.badRequest('ciquan');
    const [err, result] = await AccessService.signin(req.body);
    logger.info(err);

    if (err) throw ApiError.badRequest(err.message);
    return res.status(201).json({
      code: '20000',
      msg: 'ok',
      result,
    });
  };

  signout = async (req, res, _next) => {
    return new OKResponse({
      message: 'success',
      metadata: await AccessService.logout(req.keyStore)
    }).send(res)
  }
}

module.exports = new AccessController();
