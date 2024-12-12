const crypto = require('node:crypto');
const apikeyModel = require('../models/apikey.model');
const { logger } = require('../utils/logger.util');

const findApiKeyById = async (key) => {
  // const created = await apikeyModel.create({
  //   key: crypto.randomBytes(64).toString('hex'),
  //   permissions: ['0000'],
  // });
  // logger.warn(created);
  const apiKey = await apikeyModel.findOne({ key, status: true }).lean().exec();
  return apiKey;
};

module.exports = {
  findApiKeyById,
};
