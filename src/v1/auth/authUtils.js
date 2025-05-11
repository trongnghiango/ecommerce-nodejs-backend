const JWT = require('jsonwebtoken');
const { catchAsync } = require('../utils/helper.util');
const { ApiError } = require('../core/api-error');
const KeyTokenService = require('../services/keytoken.service'); // Updated path
const { logger } = require('../utils/logger.util');
const { db, shopsTable } = require('../databases/drizzle'); // For fetching shop roles
const { eq } = require('drizzle-orm');

const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization',
  REFRESH_TOKEN: 'x-refresh-token', // Assuming you might use this
};

/**
 * @typedef {Object} TokenPair
 * @property {string} accessToken
 * @property {string} refreshToken
 */

/**
 * @typedef {Object} JWTPayload
 * @property {number | string} userId - The user's ID (shop ID in this context).
 * @property {string} [email] - User's email (optional in payload).
 * @property {string[]} [roles] - User's roles (optional in payload but useful).
 * @property {number} iat - Issued at timestamp.
 * @property {number} exp - Expiration timestamp.
 */

/**
 * Creates a pair of access and refresh tokens.
 * @param {Pick<JWTPayload, 'userId' | 'email' | 'roles'>} payload - Data to be included in the JWT.
 * @param {string} privateKey - The RSA private key for signing.
 * @returns {Promise<TokenPair>} A promise that resolves to an object containing the accessToken and refreshToken.
 * @throws {Error} If token generation fails.
 */
const createTokenPair = async (payload, privateKey) => {
  try {
    const accessToken = JWT.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
    });
    const refreshToken = JWT.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
    });
    return { accessToken, refreshToken };
  } catch (error) {
    logger.error('Failed to create token pair:', { message: error.message, label: 'AUTH_JWT' });
    // Propagate a generic error or a specific one if needed
    throw new Error('Token generation failed.');
  }
};

/**
 * Verifies and decodes a JWT.
 * @param {string} token - The JWT string.
 * @param {string} publicKey - The RSA public key for verification.
 * @returns {Promise<JWTPayload>} A promise that resolves to the decoded payload.
 * @throws {ApiError} If verification fails (e.g., token expired, invalid signature).
 */
const decodeToken = async (token, publicKey) => {
  try {
    /** @type {JWTPayload} */
    const decoded = JWT.verify(token, publicKey, { algorithms: ['RS256'] });
    return decoded;
  } catch (error) {
    logger.warn('JWT verification failed:', {
      message: error.message,
      tokenSnippet: token.slice(0, 20),
      label: 'AUTH_JWT',
    });
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unAuthorized('Token expired. Please log in again.');
    }
    if (error.name === 'JsonWebTokenError') {
      throw ApiError.unAuthorized('Invalid token. Please log in again.');
    }
    // For other errors, rethrow as an internal server error or a generic auth error
    throw ApiError.unAuthorized('Token verification failed. Please log in again.');
  }
};

/**
 * Authentication middleware.
 * Verifies JWT, checks KeyStore, and populates `req.user` and `req.keyStore`.
 * `req.user` will include `id` and `roles`.
 * @type {import('../utils/helper.util').AsyncFunction}
 */
const authentication = catchAsync(async (req, res, next) => {
  const clientId = req.headers[HEADER.CLIENT_ID];
  if (!clientId) {
    throw ApiError.badRequest('Client ID header is missing.');
  }
  // Ensure clientId is treated as the correct type for DB lookup (e.g., number if shop ID is serial)
  const userId = parseInt(clientId, 10);
  if (isNaN(userId)) {
    throw ApiError.badRequest('Invalid Client ID format.');
  }

  const keyStore = await KeyTokenService.getKeyTokenByUserId(userId);
  if (!keyStore) {
    throw ApiError.unAuthorized('Invalid Client ID or KeyStore not found. Please log in.');
  }

  const accessToken = req.headers[HEADER.AUTHORIZATION]?.startsWith('Bearer ')
    ? req.headers[HEADER.AUTHORIZATION].substring(7)
    : req.headers[HEADER.AUTHORIZATION];

  if (!accessToken) {
    throw ApiError.badRequest('Authorization header (Bearer token) is missing.');
  }

  const decodedUser = await decodeToken(accessToken, keyStore.publicKey);

  if (decodedUser.userId !== userId) {
    throw ApiError.unAuthorized('Token does not match Client ID. Invalid session.');
  }

  // Fetch shop details to get roles (if not already in JWT payload)
  // If roles are in JWT (decodedUser.roles), you can skip this DB call.
  // For security, it's often better to fetch fresh roles from DB unless JWTs are very short-lived.
  const shop = await db
    .select({ id: shopsTable.id, roles: shopsTable.roles, email: shopsTable.email })
    .from(shopsTable)
    .where(eq(shopsTable.id, userId))
    .limit(1);

  if (!shop || shop.length === 0) {
    throw ApiError.unAuthorized('User associated with token not found in database.');
  }
  const currentShop = shop[0];

  req.keyStore = keyStore;
  /**
   * @type { {id: number, email: string, roles: string[]} }
   */
  req.user = {
    id: decodedUser.userId, // This is the shopId
    email: currentShop.email,
    roles: currentShop.roles || [], // Ensure roles is always an array
  };
  // logger.debug('Authentication successful, req.user set:', { user: req.user, label: 'AUTH' });

  return next();
});

module.exports = {
  HEADER,
  createTokenPair,
  decodeToken,
  authentication,
};
