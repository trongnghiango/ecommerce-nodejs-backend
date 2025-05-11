const express = require('express');
const profileController = require('@/v1/controllers/profile.controller');
const { catchAsync } = require('@/v1/utils/helper.util');
const { authentication } = require('@/v1/auth/authUtils');
const { authorizeAC } = require('@/v1/middlewares/authorizeAC.middleware'); // Use AccessControl middleware

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile operations (requires authentication)
 */

// All routes in this router require prior authentication.
router.use(catchAsync(authentication));

/**
 * @swagger
 * /profile/viewAny:
 *   get:
 *     tags: [Profile]
 *     summary: View any profile (Admin access)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: X-Client-Id  # Should be part of BearerAuth, but Swagger might require explicit mention
 *         in: header
 *         required: true
 *         $ref: '#/components/headers/X-Client-Id'
 *     responses:
 *       200:
 *         description: Successfully retrieved profile data (placeholder)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  '/viewAny',
  authorizeAC('read:any', 'profile'), // Permission: Can any admin role read any profile?
  catchAsync(profileController.viewAny)
);

/**
 * @swagger
 * /profile/viewOwner:
 *   get:
 *     tags: [Profile]
 *     summary: View own profile (Authenticated user/shop access)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: X-Client-Id
 *         in: header
 *         required: true
 *         $ref: '#/components/headers/X-Client-Id'
 *     responses:
 *       200:
 *         description: Successfully retrieved own profile data (placeholder)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  '/viewOwner',
  authorizeAC('read:own', 'profile'), // Permission: Can the user's role read their own profile?
  catchAsync(profileController.viewOwner)
);

module.exports = router;
