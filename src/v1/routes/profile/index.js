
const profileController = require('@/v1/controllers/profile.controller');
const { catchAsync } = require('@/v1/utils/helper.util');
const express = require('express');
const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Profile
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
 * /profile/viewAny:
 *   get:
 *     tags: [Profile]
 *     summary: Get a Profile
 *     parameters:
 *       - name: x-client-id
 *         in: header
 *         required: true
 *         description: Required client Id
 *         schema:
 *           type: string     
 *     responses:
 *       200:
 *         description: A successful response
 */
router.route("/viewAny").get(catchAsync(profileController.viewAny));


/**
 * @swagger
 * /profile/viewAny:
 *   get:
 *     tags: [Profile]
 *     summary: Get a Profile
 *     responses:
 *       200:
 *         description: A successful response
 */
router.route("viewOwn").get(catchAsync(profileController.viewOwner));

module.exports = router;