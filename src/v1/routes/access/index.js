const express = require('express');
const accessController = require('@/v1/controllers/access.controller');
const { apiKey, checkPermission } = require('@/v1/auth/checkAuth'); // Assuming these are still needed
const { authentication } = require('@/v1/auth/authUtils');
const { catchAsync } = require('../../utils/helper.util');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Access
 *   description: Authentication and Authorization operations
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     ApiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: x-api-key
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   headers:
 *     X-Client-Id:
 *       description: Required client identifier (User/Shop ID)
 *       schema:
 *         type: string
 *     X-Refresh-Token:
 *        description: Refresh token for obtaining new access tokens
 *        schema:
 *          type: string
 */

// Apply apiKey and permission checks if these routes are for initial setup or specific clients
router.use(catchAsync(apiKey)); // catchAsync for async middleware
router.use(checkPermission('0000')); // Example permission

/**
 * @swagger
 * /access/shop/signup:
 *   post:
 *     tags: [Access]
 *     summary: Register a new shop
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: My Awesome Shop
 *               email:
 *                 type: string
 *                 format: email
 *                 example: shop@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: strongpassword123
 *     responses:
 *       201:
 *         description: Shop registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponseWithShopAuthData'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/shop/signup', catchAsync(accessController.signup));

/**
 * @swagger
 * /access/shop/signin:
 *   post:
 *     tags: [Access]
 *     summary: Sign in an existing shop
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: shop@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: strongpassword123
 *     responses:
 *       200:
 *         description: Shop sign-in successful
 *         headers:
 *           X-Client-Id:
 *             $ref: '#/components/headers/X-Client-Id'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponseWithShopAuthData'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/shop/signin', catchAsync(accessController.signin));

/**
 * @swagger
 * /access/token/refresh:
 *   post:
 *     tags: [Access]
 *     summary: Refresh access token using a refresh token
 *     parameters:
 *       - name: X-Client-Id
 *         in: header
 *         required: true
 *         $ref: '#/components/headers/X-Client-Id'
 *       - name: X-Refresh-Token
 *         in: header
 *         required: true
 *         $ref: '#/components/headers/X-Refresh-Token'
 *     security: [] # Can be open if RT is validated against DB or specific key
 *                 # Or require BearerAuth if AT is needed to identify KeyStore for RT's public key
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponseWithTokens'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
// This route might or might not need `authentication` middleware depending on your refresh token strategy.
// If RT is self-contained and verified against a public key derived without needing current AT,
// then `authentication` might not be needed.
// If `authentication` is used, it verifies the AT to get keyStore, which then can be used to verify RT.
router.post(
  '/token/refresh',
  catchAsync(authentication),
  catchAsync(accessController.handleRefreshToken)
);
// A common pattern is to have /token/refresh not require AT authentication but validate RT against a stored value.
// For this example, let's assume AT is used to get the keyStore for RT validation.

// Routes below this require authentication (valid access token)
router.use(catchAsync(authentication));

/**
 * @swagger
 * /access/shop/logout:
 *   post:
 *     tags: [Access]
 *     summary: Log out the current shop
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: X-Client-Id
 *         in: header
 *         required: true
 *         $ref: '#/components/headers/X-Client-Id'
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/shop/logout', catchAsync(accessController.signout));

module.exports = router;

// Add Swagger schema definitions (e.g., in swagger.js or a separate definitions file)
/**
 * @swagger
 * components:
 *   schemas:
 *     ShopAuthData:
 *       type: object
 *       properties:
 *         shop:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             roles:
 *               type: array
 *               items:
 *                 type: string
 *         tokens:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *             refreshToken:
 *               type: string
 *     SuccessResponseWithShopAuthData:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             metadata:
 *               $ref: '#/components/schemas/ShopAuthData'
 *     SuccessResponseWithTokens:
 *        allOf:
 *          - $ref: '#/components/schemas/SuccessResponse'
 *          - type: object
 *            properties:
 *              metadata:
 *                type: object
 *                properties:
 *                  accessToken:
 *                    type: string
 *                  refreshToken:
 *                    type: string
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         code:
 *           type: integer
 *         metadata:
 *           type: object
 *           nullable: true
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *            type: boolean
 *            example: false
 *         code:
 *           type: integer
 *         message:
 *           type: string
 *         stack:
 *           type: string
 *           description: Stack trace (only in development)
 *   responses:
 *     BadRequest:
 *       description: Invalid request payload or parameters
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     Unauthorized:
 *       description: Authentication failed or token invalid/expired
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     Forbidden:
 *        description: User does not have permission to access the resource
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ErrorResponse'
 *     NotFound:
 *        description: Resource not found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ErrorResponse'
 *     InternalServerError:
 *        description: An unexpected error occurred on the server
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ErrorResponse'
 */
