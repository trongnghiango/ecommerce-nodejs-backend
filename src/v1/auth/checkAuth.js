const { ApiError } = require('../core/api-error');
const { findApiKeyById } = require('../services/apikey.service');
const { logger } = require('../utils/logger.util');

const HEADER = {
  API_KEY: 'x-api-key',
  AUTHENTICATION: 'authentication',
};

const apiKey = async (req, res, next) => {
  try {
    // 1. check x-api-key ton tai khi user req.
    const key = req.headers[HEADER.API_KEY]?.toString();
    if (!key) {
      // res.status(403).json({
      //   message: 'No',
      // });
      throw new ApiError('Notfound x-api-key', 403);
    }

    // 2. check xem  this api-key from db
    const objKey = await findApiKeyById(key);
    if (!objKey) {
      throw new ApiError('Notfound obj API key', 403);
    }

    logger.info(`middleware::apiKey:: ${objKey}`);

    // 3. gan objKey vao req
    req.objKey = objKey;
    next();
  } catch (error) {
    logger.error(error.message, {
      context: 'auth::apiKey',
    });
    next(error);
  }
};

const checkPermission = (permission) => {
  return (req, res, next) => {
    // 1. check xem co ton tai permissions trong rea.objKey khong?
    if (!req.objKey?.permissions) {
      res.status(403).json({
        msg: 'No Permission!',
      });
    }

    // 2.

    const validPermission = req.objKey.permissions.includes(permission);
    if (!validPermission) {
      throw new ApiError('Permission Deny!!!', 403);
    }

    next();
  };
};

module.exports = {
  apiKey,
  checkPermission,
};
