const express = require('express');
// const logger = require('@/v1/utils/logger.util');
const accessController = require('@/v1/controllers/access.controller');
const { apiKey, checkPermission } = require('@/v1/auth/checkAuth');
const { catchAsync } = require('../../utils/helper.util');
const { authentication } = require('@/v1/auth/authUtils');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Access
 *   description: Operations related to access
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     apiKey:
 *       type: apiKey
 *       in: header
 *       name: x-api-key
 *   headers:
 *     x-client-id:
 *       description: Required client identifier
 *       type: string
 */

/**
 * @swagger
 * /profile:
 *   get:
 *     tags: [Access]
 *     summary: Get an example
 *     responses:
 *       200:
 *         description: A successful response
 */
router.get('/profile', (req, res) => {
  res.json({
    msg: 'ciquan'
  })
})
//
router.use(apiKey);

router.use(checkPermission('0000'));

/**
 * @swagger
 * /shop/signup:
 *   post:
 *     tags: [Access]
 *     summary: Get an example
 *     responses:
 *       200:
 *         description: A successful response
 */
router.post('/shop/signup', catchAsync(accessController.signup));


/**
 * @swagger
 * /shop/signin:
 *   post:
 *     tags: [Access]
 *     summary: Register
 *     security:
 *       - apiKey: []
 *     parameters:
 *       - name: x-client-id
 *         in: header
 *         required: true
 *         description: Required client Id
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: A successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.post('/shop/signin', catchAsync(accessController.signin));

router.use(authentication)

router.post('/shop/logout', catchAsync(accessController.signout))



module.exports = router;
