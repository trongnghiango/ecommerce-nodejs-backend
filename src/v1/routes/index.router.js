const express = require('express');
const logger = require('@/v1/utils/logger.util');

const router = express.Router();

// access
router.use('/v1/api', require('./access'));

/**
 * @swagger
 * /checkstatus:
 *   get:
 *     summary: Get an example
 *     responses:
 *       200:
 *         description: A successful response
 */
router.get('/checkstatus', (req, res, _next) => {
  logger.info('It is Okay!!', { requestId: '123456789gff', context: 'status' });
  res.status(200).json({
    status: 'success',
    message: 'api ok',
  });
});

module.exports = router;
