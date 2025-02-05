const express = require('express');
// const logger = require('@/v1/utils/logger.util');
const accessController = require('@/v1/controllers/access.controller');
const { apiKey, checkPermission } = require('@/v1/auth/checkAuth');
const { catchAsync } = require('../../utils/helper.util');
const { authentication } = require('@/v1/auth/authUtils');

const router = express.Router();

//
router.use(apiKey);

router.use(checkPermission('0000'));

//
router.post('/shop/signup', catchAsync(accessController.signup));


//
router.post('/shop/signin', catchAsync(accessController.signin));

router.use(authentication)

router.post('/shop/logout', catchAsync(accessController.signout))

router.get('/profile', (req, res) => {
  res.json({
    msg: 'ciquan'
  })
})

module.exports = router;
