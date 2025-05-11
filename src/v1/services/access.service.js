const bcrypt = require('bcrypt');
const { eq } = require('drizzle-orm');
const { db, shopsTable } = require('../databases/drizzle'); // Removed keyStoresTable, handled by KeyTokenService
const { genPairKey } = require('@/v1/utils/auth.util');
const { createTokenPair, decodeToken, HEADER } = require('@/v1/auth/authUtils');
const { ApiError } = require('@/v1/core/api-error');
const KeyTokenService = require('./keytoken.service');
const { logger } = require('../utils/logger.util');

/**
 * @typedef {Object} ShopBase
 * @property {string} name
 * @property {string} email
 * @property {string[]} [roles] - Default roles for a new shop.
 */

/**
 * @typedef {ShopBase & { password?: string }} ShopRecordForDb
 */

/**
 * @typedef {Object} ShopData
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string[]} roles
 */

/**
 * @typedef {Object} Tokens
 * @property {string} accessToken
 * @property {string} refreshToken
 */

/**
 * @typedef {Object} ShopSignupPayload
 * @property {string} name
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} ShopSignupResponse
 * @property {ShopData} shop
 * @property {Tokens} tokens
 */

/**
 * @typedef {Object} ShopSigninPayload
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} ShopSigninResponse
 * @property {ShopData} shop
 * @property {Tokens} tokens
 */

/**
 * @typedef {import('./keytoken.service').KeyToken} KeyToken
 */

class AccessService {
  /**
   * Handles shop logout by removing their key token.
   * @param {KeyToken | undefined} keyStore - The keyStore object from the request, containing userId.
   * @returns {Promise<boolean>} True if logout was successful.
   * @throws {ApiError} If keyStore is missing or invalid.
   */
  static async logout(keyStore) {
    if (!keyStore || !keyStore.userId) {
      throw ApiError.badRequest('Invalid session information for logout.');
    }
    const delKey = await KeyTokenService.removeKeyTokenByUserId(keyStore.userId);
    logger.info(`Logout successful for userId: ${keyStore.userId}, key deleted: ${delKey}`, {
      label: 'ACCESS_SRV',
    });
    return delKey;
  }

  /**
   * Registers a new shop.
   * @param {ShopSignupPayload} payload - Signup data { name, email, password }.
   * @returns {Promise<ShopSignupResponse>} Object containing shop data and tokens.
   * @throws {ApiError} If email exists, or registration/token generation fails.
   */
  static async signup({ name, email, password }) {
    const start = Date.now();
    logger.info('AccessService::signup initiated', { email, label: 'ACCESS_SRV' });

    const existingShop = await db
      .select({ id: shopsTable.id })
      .from(shopsTable)
      .where(eq(shopsTable.email, email))
      .limit(1);

    if (existingShop.length > 0) {
      throw ApiError.conflict('Email already registered.');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    /** @type {ShopRecordForDb} */
    const shopToInsert = {
      name,
      email,
      password: passwordHash,
      roles: ['SHOP'], // Default role
    };

    const newShopResult = await db.insert(shopsTable).values(shopToInsert).returning({
      id: shopsTable.id,
      name: shopsTable.name,
      email: shopsTable.email,
      roles: shopsTable.roles,
    });

    if (!newShopResult || newShopResult.length === 0) {
      throw ApiError.internalError('Failed to register shop due to a database error.');
    }
    const newShop = newShopResult[0];

    const { privateKey, publicKey } = genPairKey();
    const publicKeyString = publicKey.toString(); // Ensure it's string for storage

    const storedPublicKey = await KeyTokenService.createKeyToken({
      userId: newShop.id,
      publicKey: publicKeyString,
    });

    if (!storedPublicKey) {
      // Potentially rollback shop creation or mark as inactive if key storage fails
      throw ApiError.internalError('Failed to store security keys for the new shop.');
    }

    const tokens = await createTokenPair(
      { userId: newShop.id, email: newShop.email, roles: newShop.roles },
      privateKey
    );

    logger.info(`AccessService::signup completed for ${email}`, {
      duration: Date.now() - start,
      label: 'ACCESS_SRV',
    });
    return {
      shop: {
        id: newShop.id,
        name: newShop.name,
        email: newShop.email,
        roles: newShop.roles,
      },
      tokens,
    };
  }

  /**
   * Signs in an existing shop.
   * @param {ShopSigninPayload} payload - Signin data { email, password }.
   * @returns {Promise<ShopSigninResponse>} Object containing shop data and tokens.
   * @throws {ApiError} If email not found, password mismatch, or token generation fails.
   */
  static async signin({ email, password }) {
    logger.info(`AccessService::signin attempt for ${email}`, { label: 'ACCESS_SRV' });

    const foundShopArr = await db
      .select()
      .from(shopsTable)
      .where(eq(shopsTable.email, email))
      .limit(1);

    if (foundShopArr.length === 0) {
      throw ApiError.unAuthorized('Authentication failed: Email not registered.');
    }
    const foundShop = foundShopArr[0];

    const matchedPassword = await bcrypt.compare(password, foundShop.password);
    if (!matchedPassword) {
      throw ApiError.unAuthorized('Authentication failed: Incorrect password.');
    }

    // Check if shop is active (optional, based on your schema and logic)
    // if (foundShop.status !== 'active') {
    //   throw ApiError.unAuthorized('Account is not active. Please contact support.');
    // }

    const { privateKey, publicKey } = genPairKey();
    const publicKeyString = publicKey.toString();

    const storedPublicKey = await KeyTokenService.createKeyToken({
      userId: foundShop.id,
      publicKey: publicKeyString,
    });

    if (!storedPublicKey) {
      throw ApiError.internalError('Failed to update security keys during sign-in.');
    }

    const tokens = await createTokenPair(
      { userId: foundShop.id, email: foundShop.email, roles: foundShop.roles },
      privateKey
    );

    logger.info(`Signin successful for ${email}`, { userId: foundShop.id, label: 'ACCESS_SRV' });
    return {
      shop: {
        id: foundShop.id,
        name: foundShop.name,
        email: foundShop.email,
        roles: foundShop.roles,
      },
      tokens,
    };
  }

  /**
   * Handles refreshing of access tokens using a refresh token.
   * This is a simplified version. A more robust V2 is also sketched below.
   * @param {string} refreshToken - The refresh token.
   * @param {string} [currentPublicKey] - The public key from the current key store (optional, if RT is self-verifiable).
   * @returns {Promise<Tokens>} New access and refresh tokens.
   * @throws {ApiError} If refresh token is invalid, expired, or user/keystore not found.
   */
  static async handleRefreshToken(refreshToken, currentPublicKey) {
    // This version assumes the refreshToken can be decoded and verified using a known public key
    // or the public key associated with the key store.
    // For a more robust system, refresh tokens should be stored and managed.

    // 1. Decode the refresh token to get userId. (Requires a public key if signed with RSA)
    //    If publicKey is not passed, and RT is not self-verifying, this step is problematic.
    //    This implies either RT is signed with a global secret, or we fetch KeyStore by RT itself (if stored).
    //    Let's assume for now the RT was signed with the user's specific private key,
    //    and we have the corresponding public key from their current/previous KeyStore.
    if (!currentPublicKey) {
      throw ApiError.internalError('Public key missing for refresh token validation.');
    }

    /** @type {import('../auth/authUtils').JWTPayload} */
    let decodedRefreshToken;
    try {
      decodedRefreshToken = await decodeToken(refreshToken, currentPublicKey);
    } catch (error) {
      // If decodeToken throws ApiError, it will be handled.
      // If it throws generic Error, wrap it.
      if (error instanceof ApiError) throw error;
      throw ApiError.unAuthorized('Invalid or expired refresh token.');
    }

    const { userId } = decodedRefreshToken;

    // 2. Find the KeyStore for this user to ensure it's still valid
    const keyStore = await KeyTokenService.getKeyTokenByUserId(userId);
    if (!keyStore) {
      throw ApiError.unAuthorized('User session not found or invalidated. Please log in again.');
    }

    // (OPTIONAL, but recommended for V2)
    // 3. Check if the provided refreshToken matches a stored one in KeyStore (if you store active RTs)
    // if (!keyStore.refreshTokensUsed.includes(refreshToken) && keyStore.refreshToken !== refreshToken) {
    //   // This indicates a potential misuse or an old RT.
    //   // You might want to invalidate all sessions for this user.
    //   await KeyTokenService.removeKeyTokenByUserId(userId);
    //   throw ApiError.unAuthorized('Invalid refresh token. Session terminated for security.');
    // }
    // if (keyStore.refreshTokensUsed.includes(refreshToken)) {
    //    throw ApiError.unAuthorized('Refresh token has already been used. Session terminated.');
    // }

    // 4. Fetch user details (shop details)
    const shopArr = await db.select().from(shopsTable).where(eq(shopsTable.id, userId)).limit(1);
    if (shopArr.length === 0) {
      throw ApiError.unAuthorized('User not found for refresh token.');
    }
    const shop = shopArr[0];

    // 5. Generate new key pair and tokens
    const { privateKey: newPrivateKey, publicKey: newPublicKey } = genPairKey();
    const newPublicKeyString = newPublicKey.toString();

    // 6. Update KeyStore with the new public key (and potentially the new refresh token if storing it)
    const updatedPublicKey = await KeyTokenService.createKeyToken({
      userId: shop.id,
      publicKey: newPublicKeyString,
      // oldRefreshToken: refreshToken, // Pass to mark old RT as used or replace
      // newRefreshToken: newTokens.refreshToken // If storing new RT in KeyStore
    });

    if (!updatedPublicKey) {
      throw ApiError.internalError('Failed to update security keys during token refresh.');
    }

    const newTokens = await createTokenPair(
      { userId: shop.id, email: shop.email, roles: shop.roles },
      newPrivateKey
    );

    logger.info(`Tokens refreshed for userId: ${userId}`, { label: 'ACCESS_SRV' });
    return newTokens;
  }

  /**
   * Handles refreshing of access tokens using a refresh token (Version 2 - More Robust).
   * This version assumes refresh tokens are actively managed (e.g., stored in KeyStore).
   * @param {Object} params
   * @param {string} params.refreshToken - The refresh token provided by the client.
   * @param {{id: number, roles: string[], email: string}} params.user - User object from current (possibly expired) access token.
   * @param {KeyToken} params.keyStore - The KeyStore associated with the user.
   * @returns {Promise<Tokens>} New access and refresh tokens.
   * @throws {ApiError} If refresh token is invalid, expired, user/keystore not found, or misuse detected.
   */
  static async handleRefreshTokenV2({ refreshToken, user, keyStore }) {
    if (!keyStore) {
      throw ApiError.unAuthorized('Session information missing for token refresh.');
    }

    // 1. Check if the keyStore is still valid and if the refresh token is associated with it.
    // This step depends on how you implement KeyTokenService.
    // For example, if keyStore stores the active refreshToken:
    // if (keyStore.refreshToken !== refreshToken) {
    //   logger.warn('Mismatched refresh token provided.', { userId: user.id, label: 'ACCESS_SRV_REFRESH' });
    //   throw ApiError.unAuthorized('Invalid refresh token. Session may be compromised.');
    // }
    //
    // Or, if keyStore stores a list of refreshTokensUsed:
    // if (keyStore.refreshTokensUsed && keyStore.refreshTokensUsed.includes(refreshToken)) {
    //   logger.warn('Attempt to reuse a refresh token.', { userId: user.id, label: 'ACCESS_SRV_REFRESH' });
    //   await KeyTokenService.removeKeyTokenByUserId(user.id); // Invalidate all sessions for this user
    //   throw ApiError.unAuthorized('Refresh token has already been used. All sessions terminated for security.');
    // }

    // 2. Verify the refresh token itself (e.g., check its signature and expiry using its own public key if asymmetric, or keyStore's public key)
    /** @type {import('../auth/authUtils').JWTPayload} */
    let decodedRefreshToken;
    try {
      // The public key used here should be the one that signed the refresh token.
      // This is typically the keyStore.publicKey that was active when the RT was issued.
      decodedRefreshToken = await decodeToken(refreshToken, keyStore.publicKey);
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.statusCode === 401 &&
        error.message.includes('Token expired')
      ) {
        // If RT itself is expired, remove the keystore
        await KeyTokenService.removeKeyTokenByUserId(keyStore.userId);
        throw ApiError.unAuthorized('Refresh token has expired. Please log in again.');
      }
      // For other verification errors (invalid signature etc.)
      throw ApiError.unAuthorized('Invalid refresh token provided.');
    }

    if (decodedRefreshToken.userId !== user.id) {
      throw ApiError.unAuthorized('Refresh token does not match user session.');
    }

    // 3. Fetch current user/shop details (roles might have changed)
    const shopArr = await db.select().from(shopsTable).where(eq(shopsTable.id, user.id)).limit(1);
    if (shopArr.length === 0) {
      throw ApiError.unAuthorized('User associated with refresh token not found.');
    }
    const currentShop = shopArr[0];

    // 4. Generate new key pair
    const { privateKey: newPrivateKey, publicKey: newPublicKey } = genPairKey();
    const newPublicKeyString = newPublicKey.toString();

    // 5. Create new tokens
    const newTokens = await createTokenPair(
      { userId: currentShop.id, email: currentShop.email, roles: currentShop.roles },
      newPrivateKey
    );

    // 6. Update KeyStore:
    //    - Set the new public key.
    //    - (IMPORTANT) Add the old refresh token to `refreshTokensUsed`.
    //    - (IMPORTANT) Store the new refresh token as the current `refreshToken`.
    await KeyTokenService.updateKeyTokenWithNewRefreshToken({
      userId: currentShop.id,
      newPublicKey: newPublicKeyString,
      newRefreshToken: newTokens.refreshToken,
      oldRefreshToken: refreshToken, // To mark as used
    });

    logger.info(`Tokens refreshed (V2) for userId: ${currentShop.id}`, { label: 'ACCESS_SRV' });
    return newTokens;
  }
}

module.exports = AccessService;
