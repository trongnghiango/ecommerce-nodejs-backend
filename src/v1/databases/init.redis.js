const { createClient } = require('redis');
const { logger } = require('@/v1/utils/logger.util');

const client = createClient({
  url: process.env.REDIS_URL,
});

client.ping(function (err, result) {
  logger.info(result, { label: 'REDIS' });
});

client.on('connect', () => {
  logger.info('Redis client connected', { label: 'REDIS' });
});

client.on('error', (error) => {
  logger.error(error, { label: 'REDIS' });
});

module.exports = client;
