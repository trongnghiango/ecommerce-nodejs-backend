const { createClient } = require('redis');
const { logger } = require('@/v1/utils/logger.util');

const client = createClient({
  url: process.env.REDIS_URL,
});
client.ping(function (err, result) {
  logger.info(result);
});

client.on('connect', () => {
  logger.info('Redis client connected');
});

client.on('error', (error) => {
  logger.error(error);
});

module.exports = client;
