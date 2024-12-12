const { logger } = require('../utils/logger.util');

const HEADER = {
  API_KEY: 'x-api-key',
  AUTHENTICATION: 'authentication',
};

const apiKey = (req, res, next) => {
  try {
    // check
    const key = req.headers[HEADER.API_KEY]?.toString();
    logger.info(`middleware::apiKey:: ${key}`);
  } catch (error) {
    logger.error(error.message);
    next();
  }
};

module.exports = {
  apiKey,
};
