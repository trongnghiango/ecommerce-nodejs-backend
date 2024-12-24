const express = require('express');
// const logger = require('@/v1/utils/logger.util');
const accessController = require('@/v1/controllers/access.controller');
const { apiKey, checkPermission } = require('@/v1/auth/checkAuth');
const { catchAsync } = require('../../utils/helper.util');

const router = express.Router();

//
router.use(apiKey);

router.use(checkPermission('0000'));

//
router.post('/shop/signup', catchAsync(accessController.signup));

//
router.post('/shop/signin', catchAsync(accessController.signin));

module.exports = router;
